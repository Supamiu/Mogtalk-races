import {Component, DestroyRef, inject, signal} from '@angular/core';
import {AsyncPipe, NgForOf, NgIf} from "@angular/common";
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
import {NzWaveDirective} from "ng-zorro-antd/core/wave";
import {FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {RouterLink} from "@angular/router";
import {TeamsService} from "../database/teams.service";
import {where} from "@angular/fire/firestore";
import {Auth, user} from "@angular/fire/auth";
import {debounceTime, filter, first, map, shareReplay, switchMap, take, tap} from "rxjs";
import {NzMessageModule, NzMessageService} from "ng-zorro-antd/message";
import {HttpClient} from "@angular/common/http";

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
  http = inject(HttpClient);

  teams$ = user(this.afAuth).pipe(
    filter(Boolean),
    switchMap(user => {
      return this.teamsService.query(where('leader', '==', user.uid))
    })
  )

  newTeamForm = new FormGroup({
    name: new FormControl('', Validators.required),
    members: new FormArray([
      new FormControl<number | null>(null, [Validators.required, Validators.minLength(7), Validators.maxLength(8)])
    ], Validators.required),
  });

  lodestoneIdCharacters = [
    this.checkLodestoneId(0)
  ];

  removeMember(index: number): void {
    this.newTeamForm.controls.members.removeAt(index);
    this.lodestoneIdCharacters.splice(index, 1);
  }

  addMember(): void {
    this.newTeamForm.controls.members.push(new FormControl(null, [Validators.required, Validators.minLength(7), Validators.maxLength(8)]));
    this.lodestoneIdCharacters.push(this.checkLodestoneId(this.lodestoneIdCharacters.length))
  }

  createTeam(): void {
    user(this.afAuth).pipe(
      filter(Boolean),
      take(1),
      switchMap(u => {
        return this.teamsService.addOne({
          ...this.newTeamForm.getRawValue(),
          owner: u.uid
        } as any)
      })
    ).subscribe(() => {
      this.notification.success('Team has been created !');
      this.newTeamForm.reset();
    });
  }

  checkLodestoneId(index: number) {
    return this.newTeamForm.valueChanges.pipe(
      map(value => {
        return value.members?.[index] as number
      }),
      filter((value) => value?.toString().length >= 7),
      switchMap(id => this.http.get<any>(`https://lodestone.ffxivteamcraft.com/Character/${id}`)),
      shareReplay(1)
    );
  }
}
