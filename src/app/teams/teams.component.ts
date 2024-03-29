import {Component, inject} from '@angular/core';
import {AsyncPipe} from "@angular/common";
import {NzButtonComponent} from "ng-zorro-antd/button";
import {NzCardComponent} from "ng-zorro-antd/card";
import {NzColDirective, NzRowDirective} from "ng-zorro-antd/grid";
import {NzDividerComponent} from "ng-zorro-antd/divider";
import {NzIconDirective} from "ng-zorro-antd/icon";
import {TeamsService} from "../database/teams.service";
import {where} from "@angular/fire/firestore";
import {filter, switchMap} from "rxjs";
import {NzListComponent, NzListItemComponent, NzListItemMetaComponent} from "ng-zorro-antd/list";
import {CharacterPipe} from "../auth/character.pipe";
import {Team} from "../model/team";
import {NzPopconfirmDirective} from "ng-zorro-antd/popconfirm";
import {AuthService} from "../auth/auth.service";
import {NzPageHeaderComponent, NzPageHeaderExtraDirective} from "ng-zorro-antd/page-header";
import {NzModalService} from "ng-zorro-antd/modal";
import {CreationPopupComponent} from "./creation-popup/creation-popup.component";
import {NzEmptyComponent} from "ng-zorro-antd/empty";
import {NzFlexDirective} from "ng-zorro-antd/flex";

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [
    NzListItemComponent,
    CharacterPipe,
    AsyncPipe,
    NzListComponent,
    NzListItemMetaComponent,
    NzIconDirective,
    NzButtonComponent,
    NzPopconfirmDirective,
    NzRowDirective,
    NzColDirective,
    NzCardComponent,
    NzDividerComponent,
    NzPageHeaderExtraDirective,
    NzPageHeaderComponent,
    NzEmptyComponent,
    NzFlexDirective
  ],
  templateUrl: './teams.component.html',
  styleUrl: './teams.component.less'
})
export class TeamsComponent {
  #teamsService = inject(TeamsService);
  #authService = inject(AuthService);
  #dialog = inject(NzModalService);

  teams$ = this.#authService.user$.pipe(
    filter(Boolean),
    switchMap(user => {
      return this.#teamsService.query(where('owner', '==', user.$key));
    })
  );

  removeTeamMember(team: Team, index: number): void {
    if (team.$key) {
      this.#teamsService.updateOne(team.$key, {
        members: team.members.filter((_, i) => i !== index)
      })
    }
  }

  openCreationPopup(): void {
    this.#dialog.create({
      nzContent: CreationPopupComponent,
      nzTitle: 'Create a new Team',
      nzFooter: null
    });
  }

  removeTeam(team: Team): void {
    if (team.$key) {
      this.#teamsService.deleteOne(team.$key);
    }
  }
}
