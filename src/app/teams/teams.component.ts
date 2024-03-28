import {Component, inject} from '@angular/core';
import {AsyncPipe, DatePipe, NgForOf, NgIf} from "@angular/common";
import {ImageCropperModule} from "ngx-image-cropper";
import {NzButtonComponent} from "ng-zorro-antd/button";
import {NzCardComponent} from "ng-zorro-antd/card";
import {NzColDirective, NzRowDirective} from "ng-zorro-antd/grid";
import {NzDatePickerComponent} from "ng-zorro-antd/date-picker";
import {NzDividerComponent} from "ng-zorro-antd/divider";
import {NzFormControlComponent, NzFormDirective, NzFormItemComponent, NzFormLabelComponent} from "ng-zorro-antd/form";
import {NzIconDirective} from "ng-zorro-antd/icon";
import {NzInputDirective, NzInputGroupComponent} from "ng-zorro-antd/input";
import {NzOptionComponent, NzSelectComponent} from "ng-zorro-antd/select";
import {NzSpinComponent} from "ng-zorro-antd/spin";
import {NzTagComponent} from "ng-zorro-antd/tag";
import {NzTransitionPatchDirective} from "ng-zorro-antd/core/transition-patch/transition-patch.directive";
import {NzWaveDirective} from "ng-zorro-antd/core/wave";
import {FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {RouterLink} from "@angular/router";
import {TeamsService} from "../database/teams.service";
import {where} from "@angular/fire/firestore";
import {Auth, user} from "@angular/fire/auth";
import {filter, switchMap} from "rxjs";
import {NzNotificationModule, NzNotificationService} from "ng-zorro-antd/notification";
import {NzMessageModule, NzMessageService} from "ng-zorro-antd/message";

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [
    AsyncPipe,
    NgForOf,
    NgIf,
    NzButtonComponent,
    NzCardComponent,
    NzColDirective,
    NzDatePickerComponent,
    NzDividerComponent,
    NzFormControlComponent,
    NzFormDirective,
    NzFormItemComponent,
    NzFormLabelComponent,
    NzIconDirective,
    NzInputDirective,
    NzInputGroupComponent,
    NzOptionComponent,
    NzRowDirective,
    NzSelectComponent,
    NzSpinComponent,
    NzTagComponent,
    NzTransitionPatchDirective,
    NzWaveDirective,
    ReactiveFormsModule,
    RouterLink,
    NzMessageModule
  ],
  templateUrl: './teams.component.html',
  styleUrl: './teams.component.less'
})
export class TeamsComponent {
  teamsService = inject(TeamsService);
  notification = inject(NzMessageService);
  afAuth = inject(Auth);

  teams$ = user(this.afAuth).pipe(
    filter(Boolean),
    switchMap(user => {
      return this.teamsService.query(where('leader', '==', user.uid))
    })
  )

  newTeamForm = new FormGroup({
    name: new FormControl('', Validators.required),
    members: new FormArray([
      new FormControl(0)
    ], Validators.required),
  });

  removeMember(index: number): void {
    this.newTeamForm.controls.members.removeAt(index);
  }

  addMember(): void {
    this.newTeamForm.controls.members.push(new FormControl(0, Validators.required))
  }

  createTeam(): void {
    this.teamsService.addOne(this.newTeamForm.getRawValue()as any).subscribe(() => {
      this.notification.success('Race has been created !');
      this.newTeamForm.reset();
    });
  }
}
