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
// import { v4 as uuidv4 } from 'uuid';
import { FirstKeyPipe } from '../shared/pipes/first-key.pipe';
import { environment } from '../../environments/environment';
import { title } from 'process';

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

  toUpdateTask = false;
  taskPresentMessage = 'Task is already Present';

  form: FormGroup;

  constructor(
    public formBuilder: FormBuilder,
    private http: HttpClient,
    private toastr: ToastrService,
    private dialogRef: MatDialogRef<AddTaskPopupComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      allAssignees: any;
      billingType: any;
      isEmployee: any;
      userDetails: any;
    }
  ) {
    // console.log(data.billingType);
    // let x = data.billingType;
    this.form = this.formBuilder.group(
      {
        taskName: ['', Validators.required],
        taskId: ['', Validators.required],
        searchTerm: [''],
        startDate: ['', [Validators.required]],
        dueDate: ['', [Validators.required]],
        billingType: [data.billingType],
      },
      { validators: this.dateMatchValidator }
    );
    console.log(this.assigneeList);
  }

  ngOnInit() {
    this.form
      .get('billingType')
      ?.setValue(this.formatBillingType(this.data.billingType));
  }

  formatBillingType(value: string): string {
    if (!value) return ''; // Handle undefined/null case
    return value
      .split('-') // Split words at '-'
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize first letter
      .join('-'); // Rejoin with '-'
  }

  baseURL = environment.apiBaseUrl;

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


  isResetting = false;

  handleBlur() {
    if (!this.isResetting) {
      this.checkTaskId(); // Only execute when not resetting
    }
    this.isResetting = false; // Reset flag after blur execution

  }
  
  preventBlurExecution() {
    this.isResetting = true; // Set flag before blur event fires
  }

  onReset() {
    this.form.reset();
    this.toUpdateTask = false;
    setTimeout(() => {
      this.isResetting = false; // Allow blur event after reset
    }, 100);

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
      taskID: this.form.value.taskId,
      task: this.form.value.taskName,
      assignee: this.assigneeList,
      startDate: new Date(this.form.value.startDate),
      dueDate: new Date(this.form.value.dueDate),
      billingType: this.form.value.billingType,
    };
    console.log(this.form);
    console.log(details);
    console.log(this.form.value.taskName);

    if (this.data.isEmployee &&
      !details.assignee.some(
        (a: any) => a.empId === this.data.userDetails.empId
      )
    ) {
      details.assignee.push({
        assignee: this.data.userDetails.name,
        empId: this.data.userDetails.empId,
      });

    }

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

    console.log(taskDetails, this.toUpdateTask);
    // this.onReset();

    if (this.toUpdateTask) {
      console.log(taskDetails);
      this.http
        .put(`${this.baseURL}/tasks/update-task`, taskDetails)
        .subscribe({
          next: (res: any) => {
            this.toastr.success('Task Updated!', 'Task Updation Successful');
            // alert('Task updated successfully!');
            this.dialogRef.close('success'); // Pass "success" when closing
            console.log(res);
            this.onReset();
          },
          error: (err: any) => console.log('error while adding task:\n', err),
        });

    } else {
      console.log("ADD task")
      this.onReset();

      this.http.post(`${this.baseURL}/tasks/upload`, taskDetails).subscribe({
        next: (res: any) => {
          // this.onReset();
          this.toastr.success('New Task created!', 'Task Creation Successful');
          this.dialogRef.close('success'); // Pass "success" when closing
          console.log(res);
        },
        error: (err: any) => console.log('error while adding task:\n', err),
      });
    }
  }

  checkTaskId() {
    const taskId = this.form.get('taskId')?.value;
    if (taskId) {
      this.http.get<any>(`${this.baseURL}/tasks/users/${taskId}`).subscribe({
        next: (res: any) => {
          console.log(res);

          if (res['taskID'] != null || res['taskID'] != undefined) {
            this.toUpdateTask = true;

            this.form.patchValue({
              taskName: res.task,
              dueDate: res.dueDate.split('T')[0],
              startDate: res.startDate.split('T')[0],
              billingType: res.billingType,
            });
            // this.assigneeList = [...res.assignee]
            console.log(res.assignee);

            // if (this.data.isEmployee) {
            //   if (!res.assignee.empId.includes(this.data.userDetails.empId)) {
            //     res.assignee.assignee.push(this.data.userDetails.name);
            //     res.assignee.empId.push(this.data.userDetails.empId);
            //   } else {
            //     // alert("You already have this task");
            //     console.log('You already have this task');
            //   }
            // }

            const transformedData = res.assignee.assignee.map(
              (name: any, index: any) => ({
                assignee: name,
                empId: res.assignee.empId[index],
              })
            );

            console.log(transformedData, this.toUpdateTask);
            this.assigneeList = transformedData;
          } else {
            this.toUpdateTask = false;

            this.form.patchValue({
              taskName: '',
              dueDate: '',
              startDate: '',
              // billingType: res.billingType,
            });
            this.form
              .get('billingType')
              ?.setValue(this.formatBillingType(this.data.billingType));
            this.assigneeList = [];

            console.log('NO Task Found', this.toUpdateTask);
          }
        },
        error: (err: any) =>
          console.log('Task ID not found, enter new details.'),
      });
    }
  }

  preventSubmit(event: any) {
    event.preventDefault(); // Prevents form submission when Enter is pressed
  }

  onChangeInput() {
    console.log(this.form.value);
    if (this.form.value.taskId === '') {
      this.toUpdateTask = false;

      this.form.patchValue({
        taskName: '',
        dueDate: '',
        startDate: '',
        // billingType: res.billingType,
      });
      this.form
        .get('billingType')
        ?.setValue(this.formatBillingType(this.data.billingType));
      this.assigneeList = [];
    }
  }

  filterAssignees() {
    if (!this.form.value.searchTerm) {
      this.filteredAssignees = [];
      return;
    }

    this.filteredAssignees = this.data.allAssignees.filter(
      (user: any) =>
        !this.assigneeList.some(
          (a: { empId: string }) => a.empId === user.empId
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
      empId: assignee.empId,
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
