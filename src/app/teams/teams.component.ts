import {Component, inject} from '@angular/core';
import {AsyncPipe} from "@angular/common";
import {NzButtonComponent} from "ng-zorro-antd/button";
import {NzCardComponent} from "ng-zorro-antd/card";
import {NzColDirective, NzRowDirective} from "ng-zorro-antd/grid";
import {NzDividerComponent} from "ng-zorro-antd/divider";
import {NzIconDirective} from "ng-zorro-antd/icon";
import {TeamsService} from "../database/teams.service";
import {NzListComponent, NzListItemComponent, NzListItemMetaComponent} from "ng-zorro-antd/list";
import {CharacterPipe} from "../auth/character.pipe";
import {Team} from "../model/team";
import {NzPopconfirmDirective} from "ng-zorro-antd/popconfirm";
import {
  NzPageHeaderComponent,
  NzPageHeaderContentDirective,
  NzPageHeaderExtraDirective
} from "ng-zorro-antd/page-header";
import {NzModalService} from "ng-zorro-antd/modal";
import {CreationPopupComponent} from "./creation-popup/creation-popup.component";
import {NzEmptyComponent} from "ng-zorro-antd/empty";
import {NzFlexDirective} from "ng-zorro-antd/flex";
import {NzStatisticComponent} from "ng-zorro-antd/statistic";
import {BehaviorSubject, combineLatest, map} from "rxjs";
import {NzInputDirective, NzInputGroupComponent} from "ng-zorro-antd/input";
import {FormsModule} from "@angular/forms";
import {NzSpinComponent} from "ng-zorro-antd/spin";

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
    NzFlexDirective,
    NzStatisticComponent,
    NzPageHeaderContentDirective,
    NzInputDirective,
    FormsModule,
    NzInputGroupComponent,
    NzSpinComponent
  ],
  templateUrl: './teams.component.html',
  styleUrl: './teams.component.less'
})
export class TeamsComponent {
  #teamsService = inject(TeamsService);
  // #authService = inject(AuthService);
  #dialog = inject(NzModalService);

  query$ = new BehaviorSubject<string>('');

  allTeams$ = this.#teamsService.query();

  teams$ = combineLatest([this.query$, this.allTeams$]).pipe(
    map(([query, teams]) => {
      return teams.filter(team => team.name.toLowerCase().includes(query.toLowerCase()));
    })
  );
  // Members management
  // removeTeamMember(team: Team, index: number): void {
  //   if (team.$key) {
  //     this.#teamsService.updateOne(team.$key, {
  //       members: team.members.filter((_, i) => i !== index)
  //     })
  //   }
  // }

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
