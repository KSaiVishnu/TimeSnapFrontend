import { LiveAnnouncer } from '@angular/cdk/a11y';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  model,
  OnInit,
  Output,
  signal,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import SaveIcon from '@mui/icons-material/Save';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../snackbar/snackbar.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-edit-assignee-names',
  imports: [
    MatFormFieldModule,
    MatChipsModule,
    MatIconModule,
    MatAutocompleteModule,
    FormsModule,
    MatButtonModule,
    MatTooltipModule,
    CommonModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './edit-assignee-names.component.html',
  styleUrl: './edit-assignee-names.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class EditAssigneeNamesComponent implements OnInit {
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  readonly currentFruit = model('');
  fruits: any = signal([]);
  allFruits: any[] = [];
  filteredFruits = computed(() => {
    const currentFruit = this.currentFruit().toLowerCase();
    console.log(currentFruit);

    this.allFruits = this.allFruits.filter(
      (user: any) =>
        !this.fruits().some(
          (a: { empId: string }) => a.empId === user.empId
        )
    );

    if (this.currentFruit() === '') {
      return [];
    }
    return currentFruit
      ? this.allFruits.filter((fruit) =>
          fruit.userName.toLowerCase().includes(currentFruit)
        )
      : this.allFruits.slice();
  });

  readonly announcer = inject(LiveAnnouncer);

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private toastr: ToastrService,) {}

  @Input() assignee: any;
  originalAssignees: string[] = [];

  @Input() taskId: any;
  // @Input() allAssignees: any;
  @Input() allAssignees: any[] = []; // Receive employees from AllTasks


  @Input() currentlyEditingTaskId!: number | null;
  @Output() editModeChange = new EventEmitter<number | null>();

  @Output() assigneesUpdated = new EventEmitter<string[]>();


  @ViewChild('fruitInput') fruitInput!: ElementRef;


  baseURL = environment.apiBaseUrl;

  // allAssignees: { userName: string; employeeId: string }[] = []; // Store all users
  isEditing = false;

  ngOnInit() {
    console.log(this.assignee);
    console.log(this.taskId);
    this.originalAssignees = [...this.assignee]; // deep copy to restore later

    // for (let item of this.assignee) {
    //   this.fruits.set([...this.fruits(), item]);
    // }

    this.fruits.set([...this.assignee]);
    console.log(this.fruits());

    // this.fetchAssignees(); // Fetch data when component loads
    console.log(this.allAssignees);
    this.allFruits = this.allAssignees;
  }

  // ngOnChanges(changes: SimpleChanges) {
  //   if (changes['allAssignees'] && changes['allAssignees'].currentValue) {
  //     console.log('Updated assignees:', this.allAssignees);
  //     // this.cdr.detectChanges(); // Force UI update
  //   }
  // }


  ngOnChanges(changes: SimpleChanges) {
    if (changes['allAssignees'] && changes['allAssignees'].currentValue) {
      console.log("Updated employees in EditAssignee:", this.allAssignees);
      this.allFruits = this.allAssignees
    }
    if (changes['currentlyEditingTaskId'] && this.taskId === this.currentlyEditingTaskId) {
      setTimeout(() => {
        this.fruitInput?.nativeElement.focus();
      }, 0); // Ensures input is available in DOM before focusing
    }
  }

  fetchAssignees() {
    this.http
      .get<{ userName: string; employeeId: string }[]>(
        `${this.baseURL}/user-employee`
      )
      .subscribe((data) => {
        this.allAssignees = data;
        // console.log(data);
        this.allFruits = data;
        // console.log(this.allAssignees);
        // console.log(this.allFruits);
      });
  }


  // Add this method to your component class
getChipColor(index: number): { [key: string]: string } {
  // Array of color combinations (background and text color)
  const colors = [
    { bg: '#e3f2fd', color: '#1976d2' }, // Blue
    { bg: '#f3e5f5', color: '#9c27b0' }, // Purple
    { bg: '#e8f5e9', color: '#388e3c' }, // Green
    { bg: '#fff8e1', color: '#ffa000' }, // Amber
    { bg: '#ffebee', color: '#d32f2f' }, // Red
    { bg: '#e0f7fa', color: '#0097a7' }, // Cyan
    { bg: '#f1f8e9', color: '#689f38' }, // Light Green
    { bg: '#fce4ec', color: '#c2185b' }  // Pink
  ];
  
  // // Use modulo to cycle through colors
  // const colorIndex = index % colors.length;
  // return {
  //   backgroundColor: colors[colorIndex].bg,
  //   color: colors[colorIndex].color
  // };

    // Generate a random index
    const randomIndex = Math.floor(Math.random() * colors.length);
  
    return {
      backgroundColor: colors[randomIndex].bg,
      color: colors[randomIndex].color
    };
}

  // filterAssignees(){
  //   this.allFruits = this.allFruits.filter(
  //     (user: any) =>
  //       !this.fruits().some(
  //         (a: { empId: string }) => a.empId === user.employeeId
  //       )
  //   );
  //   // this.filteredFruits = computed(() => {
  //   //   const currentFruit = this.currentFruit().toLowerCase();

  //   //   this.allFruits = this.allFruits.filter(
  //   //     (user: any) =>
  //   //       !this.assignee.some(
  //   //         (a: { empId: string }) => a.empId === user.employeeId
  //   //       )
  //   //   );

  //   //   if (this.currentFruit() === '') {
  //   //     return [];
  //   //   }
  //   //   return currentFruit
  //   //     ? this.allFruits.filter((fruit) => fruit.userName.toLowerCase().includes(currentFruit))
  //   //     : this.allFruits.slice();
  //   // });
  // }

  // filterAssignees(task: any) {
  //   if (!task.currentFruit) {
  //     task.filteredAssignees = [];
  //     return;
  //   }
  //   task.filteredAssignees = this.allAssignees.filter(
  //     (user: any) =>
  //       !task.assignee.some(
  //         (a: { empId: string }) => a.empId === user.employeeId
  //       )
  //   );
  //   task.filteredAssignees = task.filteredAssignees.filter((a: any) =>
  //     a.userName.toLowerCase().includes(task.searchTerm.toLowerCase())
  //   );
  //   console.log(task.filteredAssignees);
  // }

  // add(event: MatChipInputEvent): void {
  //   const value = (event.value || '').trim();

  //   // Add our fruit
  //   if (value) {
  //     this.fruits.update((fruits:any) => [...fruits, value]);
  //   }

  //   // Clear the input value
  //   this.currentFruit.set('');
  // }

  onEdit() {
    this.isEditing = !this.isEditing;
    this.editModeChange.emit(this.taskId); // Notify parent that this row is in editing mode
    // this.fruitInput.nativeElement.focus(); // Set focus on the input field
  }

  cross() {
    this.isEditing = !this.isEditing;
    this.editModeChange.emit(null); // Notify parent that editing mode is off
  }

  saveTaskChanges() {
    // console.log(task);
    // console.log(this.fruits());
    var assignees = this.fruits().map((each: any) => {
      return {
        assignee: each.fullName,
        empId: each.empId,
      };
    });

    console.log(this.taskId);
    console.log(assignees);

    this.http
      .put<any>(`${this.baseURL}/tasks/update-task-assignees/${this.taskId}`, assignees)
      .subscribe({
        next: (response) => {
          console.log('Task updated successfully');
          this.assigneesUpdated.emit(assignees); // Emit the updated assignees to the parent
          this.openSnackBar();
        },
        error: (err) => {
          console.log('Error updating task:', err);
          this.assigneesUpdated.emit(this.originalAssignees);

                  // ❗ Restore original assignees in UI
        this.fruits.set([...this.originalAssignees]);

        // ❗ Recompute `allFruits` again to reflect what's selectable
        // this.allFruits = this.allFruits.filter(
        //   (user: any) =>
        //     !this.originalAssignees.some(
        //       (a: any) => a.empId === user.empId
        //     )
        // );

          this.toastr.error(err.error, 'Task Updation Failed');
        },
      });

    this.isEditing = !this.isEditing;
    this.editModeChange.emit(null); // Notify parent that editing mode is off
    // this.openSnackBar();
  }

  // snackbar
  private _snackBar = inject(MatSnackBar);
  durationInSeconds = 5;
  openSnackBar() {
    this._snackBar.openFromComponent(SnackbarComponent, {
      duration: this.durationInSeconds * 1000,
      data: {
        message: 'Changes Saved Successfully',
      },
    });
  }

  // remove(fruit: string): void {
  //   this.fruits.update((fruits:any) => {
  //     const index = fruits.indexOf(fruit);
  //     if (index < 0) {
  //       return fruits;
  //     }

  //     fruits.splice(index, 1);
  //     this.announcer.announce(`Removed ${fruit}`);
  //     return [...fruits];
  //   });
  //   console.log(this.filteredFruits);

  // }

  remove(fruit: any): void {
    this.fruits.update((fruits: any) => {
      return fruits.filter((f: any) => f.empId !== fruit.empId);
    });

    // Add back to the available list for autocomplete
    this.allFruits.push({
      userName: fruit.fullName,
      empId: fruit.empId,
    });

    this.announcer.announce(`Removed ${fruit.fullName}`);
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    // console.log(event.option);
    let newItem = {
      fullName: event.option.value.userName,
      empId: event.option.value.empId,
    };
    this.fruits.update((fruits: any) => [newItem, ...fruits]);
    this.currentFruit.set('');
    event.option.deselect();
  }



  // ngOnChanges() {
  //   this.cdr.markForCheck();  // Trigger change detection
  // }
}
