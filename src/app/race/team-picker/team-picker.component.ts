import {Component, inject} from '@angular/core';
import {TeamsService} from "../../database/teams.service";
import {NZ_MODAL_DATA, NzModalRef} from "ng-zorro-antd/modal";
import {BehaviorSubject, combineLatest, debounceTime, map, startWith} from "rxjs";
import {Race} from "../../model/race";
import {FormsModule} from "@angular/forms";
import {AsyncPipe} from "@angular/common";
import {NzInputDirective, NzInputGroupComponent} from "ng-zorro-antd/input";
import {
  NzListComponent,
  NzListItemComponent,
  NzListItemMetaAvatarComponent,
  NzListItemMetaTitleComponent
} from "ng-zorro-antd/list";
import {NzCheckboxComponent} from "ng-zorro-antd/checkbox";
import {Team} from "../../model/team";
import {NzDividerComponent} from "ng-zorro-antd/divider";
import {NzButtonComponent} from "ng-zorro-antd/button";
import {NzSpaceComponent, NzSpaceItemDirective} from "ng-zorro-antd/space";
import {NzEmptyComponent} from "ng-zorro-antd/empty";

@Component({
  selector: 'app-team-picker',
  standalone: true,
  imports: [
    FormsModule,
    AsyncPipe,
    NzInputDirective,
    NzInputGroupComponent,
    NzListComponent,
    NzListItemComponent,
    NzListItemMetaAvatarComponent,
    NzCheckboxComponent,
    NzListItemMetaTitleComponent,
    NzDividerComponent,
    NzButtonComponent,
    NzSpaceComponent,
    NzSpaceItemDirective,
    NzEmptyComponent
  ],
  templateUrl: './team-picker.component.html',
  styleUrl: './team-picker.component.less'
})
export class TeamPickerComponent {

  #teamsService = inject(TeamsService);

  #race: Race = inject(NZ_MODAL_DATA);

  #ref = inject(NzModalRef);

  allTeams$ = this.#teamsService.query();

  query$ = new BehaviorSubject('');

  availableTeams$ = combineLatest([this.allTeams$, this.query$.pipe(debounceTime(200), startWith(''))]).pipe(
    map(([teams, query]) => {
      return teams.filter(team => {
        return !this.#race.teams.includes(team.$key as string) && team.name.toLowerCase().includes(query.toLowerCase());
      })
    })
  );

  selection: Team[] = [];

  toggleSelection(team: Team, selected: boolean): void {
    if (selected) {
      this.selection.push(team);
    } else {
      this.selection = this.selection.filter(t => t.$key !== team.$key);
    }
  }

  register(): void {
    this.#ref.close(this.selection);
  }

  cancel(): void {
    this.#ref.close();
  }
}
