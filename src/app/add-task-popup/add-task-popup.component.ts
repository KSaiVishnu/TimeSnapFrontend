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

@Component({
  selector: 'app-add-task-popup',
  imports: [FormsModule, CommonModule, ReactiveFormsModule, FirstKeyPipe],
  templateUrl: './add-task-popup.component.html',
  styleUrl: './add-task-popup.component.css',
})
export class AddTaskPopupComponent {
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
    private dialogRef: MatDialogRef<AddTaskPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { allAssignees: any }
  ) {
    this.form = this.formBuilder.group(
      {
        taskName: ['', Validators.required],
        searchTerm: [''],
        startDate: ['', [Validators.required]],
        dueDate: ['', [Validators.required]],
        billingType: ['Non-Billable'],
      },
      { validators: this.dateMatchValidator }
    );
    console.log(this.assigneeList);
  }

  dateMatchValidator: ValidatorFn = (control: AbstractControl): null => {
    const startDate = control.get('startDate');
    const dueDate = control.get('dueDate');

    // if (startDate && dueDate && startDate?.value!='' && dueDate?.value!='' && startDate.value >= dueDate.value)
    //   dueDate?.setErrors({ dateError: true });
    // else dueDate?.setErrors(null);

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

  // onReset() {
  // this.form.value.taskName = '';
  // this.form.value.startDate = '';
  // this.form.value.dueDate = '';
  // this.form.value.billingType = 'Non-Billable';
  // this.form.reset();
  // this.form.value.billingType = 'Non-Billable';
  // this.filteredAssignees = [];
  // this.form.value.searchTerm = '';
  //   this.assigneeList = [];
  //   this.showSuggestions = false;
  // }

  onReset() {
    this.form.reset(); // Reset all form fields
    this.form.patchValue({
      billingType: 'Non-Billable',
      searchTerm: '',
    });
    this.filteredAssignees = [];
    this.assigneeList = [];
    this.showSuggestions = false;
  }

  onAddTask() {
    let details = {
      taskID: uuidv4(),
      task: this.form.value.taskName,
      assignee: this.assigneeList,
      startDate: new Date(this.form.value.startDate),
      dueDate: new Date(this.form.value.dueDate),
      billingType: this.form.value.billingType,
    };
    // console.log(this.form);
    // console.log(details);
    // console.log(this.form.value.taskName)
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

    // console.log(taskDetails);

    this.onReset();
    this.http
      .post('https://localhost:7062/api/tasks/upload', taskDetails)
      .subscribe({
        next: (res: any) => {
          this.toastr.success(
            'New Task created!',
            'Task Creation Successful'
          );
          this.dialogRef.close('success'); // Pass "success" when closing

          console.log(res);
        },
        error: (err: any) => console.log('error while adding task:\n', err),
      });
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
