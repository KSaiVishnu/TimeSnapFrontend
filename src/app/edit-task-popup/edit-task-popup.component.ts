import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Inject, Output } from '@angular/core';
import {
  FormsModule,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  ValidatorFn,
  AbstractControl,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { v4 as uuidv4 } from 'uuid';
import { FirstKeyPipe } from '../shared/pipes/first-key.pipe';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-edit-task-popup',
  imports: [FormsModule, CommonModule, ReactiveFormsModule, FirstKeyPipe],
  templateUrl: './edit-task-popup.component.html',
  styleUrl: './edit-task-popup.component.css',
})
export class EditTaskPopupComponent {
  // searchTerm: string = '';
  showSuggestions: any;
  filteredAssignees: any = [];
  assigneeList: any = [];

  // allAssignees: { userName: string; employeeId: string }[] = []; // Store all users
  // taskName: string = '';
  // startDate: any;
  // dueDate: any;
  // billingType: string = 'Non-Billable';

  @Output() taskAdded = new EventEmitter<void>(); // Event to notify parent

  form: FormGroup;

  constructor(
    public formBuilder: FormBuilder,
    private http: HttpClient,
    private toastr: ToastrService,
    private dialogRef: MatDialogRef<EditTaskPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { allAssignees: any; task: any }
  ) {
    this.form = this.formBuilder.group(
      {
        taskName: [data.task.task, Validators.required],
        searchTerm: [''],
        startDate: [data.task.startDate.split('T')[0], [Validators.required]],
        dueDate: [data.task.dueDate.split('T')[0], [Validators.required]],
        billingType: [data.task.billingType],
      },
      { validators: this.dateMatchValidator }
    );
    this.assigneeList = [...data.task.assignee];
    console.log(this.assigneeList);
  }

  baseURL = environment.apiBaseUrl;

  dateMatchValidator: ValidatorFn = (control: AbstractControl): null => {
    const startDate = control.get('startDate');
    const dueDate = control.get('dueDate');

    const errors = dueDate?.errors || {}; // Preserve existing errors
    if (startDate && dueDate && startDate.value > dueDate.value) {
      dueDate.setErrors({ ...errors, dateError: true });
    } else {
      if (errors['dateError']) {
        delete errors['dateError'];
        dueDate?.setErrors(Object.keys(errors).length ? errors : null);
      }
    }

    return null;
  };

  onChangeDate() {
    console.log(this.form);
  }

  onReset() {
    console.log(this.data.task);
    this.form.reset(); // Reset all form fields
    this.form.patchValue({
      billingType: 'Non-Billable',
      searchTerm: '',
    });
    this.filteredAssignees = [];
    this.assigneeList = [];
    this.showSuggestions = false;
  }

  onEditTask() {
    let details = {
      taskID: this.data.task.taskID,
      task: this.form.value.taskName,
      assignee: this.assigneeList,
      startDate: new Date(this.form.value.startDate),
      dueDate: new Date(this.form.value.dueDate),
      billingType: this.form.value.billingType,
    };

    console.log(details);

    let taskDetails = details.assignee.map((each: any) => {
      return {
        task: details.task,
        taskID: details.taskID,
        assignee: each.assignee,
        empId: each.empId,
        startDate: details.startDate,
        dueDate: details.dueDate,
        billingType: details.billingType,
      };
    });

    console.log(taskDetails);

    this.onReset();

    this.http
      .put(`${this.baseURL}/tasks/update-task`, taskDetails)
      .subscribe({
        next: (res: any) => {
          this.toastr.success('Task Updated!', 'Task Updation Successful');
          // alert('Task updated successfully!');
          this.dialogRef.close('success'); // Pass "success" when closing

          console.log(res);
        },
        error: (err: any) => console.log('error while adding task:\n', err),
      });



    // .subscribe(
    //   () => {
    //     alert('Task updated successfully!');
    //     // this.loadTasks(); // Reload updated tasks
    //   },
    //   (error) => {
    //     console.error('Error updating task', error);
    //   }
    // );

    // this.http
    //   .post('https://localhost:7062/api/tasks/upload', taskDetails)
    //   .subscribe({
    //     next: (res: any) => {
    //       this.toastr.success(
    //         'New Task created!',
    //         'Task Creation Successful'
    //       );
    //       this.dialogRef.close('success'); // Pass "success" when closing

    //       console.log(res);
    //     },
    //     error: (err: any) => console.log('error while adding task:\n', err),
    //   });
  }

  filterAssignees() {
    if (!this.form.value.searchTerm) {
      this.filteredAssignees = [];
      return;
    }

    this.filteredAssignees = this.data.allAssignees.filter(
      (user: any) =>
        !this.assigneeList.some(
          (a: { empId: string }) => a.empId === user.employeeId
        )
    );

    this.filteredAssignees = this.filteredAssignees.filter((a: any) =>
      a.userName
        .toLowerCase()
        .includes(this.form.value.searchTerm.toLowerCase())
    );
  }

  selectAssignee(assignee: any) {
    console.log(assignee);
    this.assigneeList.push({
      assignee: assignee.userName,
      empId: assignee.employeeId,
    });
    console.log(this.assigneeList);
    // console.log(this.form.value)
    this.form.controls['searchTerm'].setValue('');
    // console.log(this.form.value)
    this.showSuggestions = false;
    this.filteredAssignees = [];
  }

  removeAssignee(index: number) {
    this.assigneeList.splice(index, 1);
    console.log(this.assigneeList);
  }

  onClosePopup() {
    this.dialogRef.close();
  }
}
