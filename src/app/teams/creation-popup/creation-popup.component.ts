import {Component, inject} from '@angular/core';
import {AsyncPipe, NgForOf, NgIf} from "@angular/common";
import {NzButtonComponent} from "ng-zorro-antd/button";
import {NzCardComponent} from "ng-zorro-antd/card";
import {NzColDirective, NzRowDirective} from "ng-zorro-antd/grid";
import {NzDividerComponent} from "ng-zorro-antd/divider";
import {NzFormControlComponent, NzFormDirective, NzFormItemComponent} from "ng-zorro-antd/form";
import {NzIconDirective} from "ng-zorro-antd/icon";
import {NzInputDirective, NzInputGroupComponent} from "ng-zorro-antd/input";
import {FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {filter, switchMap, take} from "rxjs";
import {NzMessageService} from "ng-zorro-antd/message";
import {AuthService} from "../../auth/auth.service";
import {TeamsService} from "../../database/teams.service";
import {NzModalRef} from "ng-zorro-antd/modal";
import {NzListComponent, NzListItemComponent, NzListItemMetaComponent} from "ng-zorro-antd/list";
import {CharacterPipe} from "../../auth/character.pipe";
import {NzPopconfirmDirective} from "ng-zorro-antd/popconfirm";

@Component({
  selector: 'app-creation-popup',
  standalone: true,
  imports: [
    AsyncPipe,
    NgForOf,
    NgIf,
    NzButtonComponent,
    NzCardComponent,
    NzColDirective,
    NzDividerComponent,
    NzFormControlComponent,
    NzFormDirective,
    NzFormItemComponent,
    NzIconDirective,
    NzInputDirective,
    NzInputGroupComponent,
    NzRowDirective,
    ReactiveFormsModule,
    NzListComponent,
    NzListItemComponent,
    CharacterPipe,
    NzListItemMetaComponent,
    NzPopconfirmDirective,
    FormsModule
  ],
  templateUrl: './creation-popup.component.html',
  styleUrl: './creation-popup.component.less'
})
export class CreationPopupComponent {
  #teamsService = inject(TeamsService);
  #authService = inject(AuthService);
  #notification = inject(NzMessageService);
  #ref = inject(NzModalRef);
  user$ = this.#authService.user$;

  newMember?: number;

  newTeamForm = new FormGroup({
    name: new FormControl('', Validators.required),
    members: new FormArray([
      new FormControl<number>(0, [Validators.required, Validators.minLength(7), Validators.maxLength(8)])
    ], Validators.required),
  });

  constructor() {
    this.user$.pipe(
      take(1)
    ).subscribe(user => {
      this.newTeamForm.controls.members.controls[0].patchValue(user.lodestoneId);
    })
  }

  createTeam(): void {
    this.user$.pipe(
      filter(Boolean),
      take(1),
      switchMap(u => {
        return this.#teamsService.addOne({
          ...this.newTeamForm.getRawValue(),
          owner: u.$key
        } as any)
      })
    ).subscribe(() => {
      this.#notification.success('Team has been created !');
      this.newTeamForm.reset();
      this.#ref.close();
    });
  }

  removeMemberFromForm(index: number): void {
    this.newTeamForm.controls.members.removeAt(index);
  }

  addMember(): void {
    this.newTeamForm.controls.members.push(new FormControl(this.newMember as number, [Validators.required, Validators.minLength(7), Validators.maxLength(8)]));
    delete this.newMember;
  }
}
