import {Component, inject} from '@angular/core';
import {RaceService} from "../database/race.service";
import {ActivatedRoute} from "@angular/router";
import {combineLatest, filter, map, shareReplay, switchMap, timer} from "rxjs";
import {AuthService} from "../auth/auth.service";
import {Race} from "../model/race";
import {arrayUnion, Timestamp} from "@angular/fire/firestore";
import {Team} from "../model/team";
import {NzModalService} from "ng-zorro-antd/modal";
import {TeamPickerComponent} from "./team-picker/team-picker.component";
import {NzPageHeaderComponent, NzPageHeaderExtraDirective, NzPageHeaderTagDirective} from "ng-zorro-antd/page-header";
import {AsyncPipe, DatePipe, UpperCasePipe} from "@angular/common";
import {NzTagComponent} from "ng-zorro-antd/tag";
import {NzSpaceComponent, NzSpaceItemDirective} from "ng-zorro-antd/space";
import {NzPopconfirmDirective} from "ng-zorro-antd/popconfirm";
import {NzButtonComponent} from "ng-zorro-antd/button";
import {NzDividerComponent} from "ng-zorro-antd/divider";
import {NzSpinComponent} from "ng-zorro-antd/spin";
import {LeaderboardComponent} from "../leaderboard/leaderboard.component";
import {NzFlexDirective} from "ng-zorro-antd/flex";
import {NzTransitionPatchDirective} from "ng-zorro-antd/core/transition-patch/transition-patch.directive";
import {NzWaveDirective} from "ng-zorro-antd/core/wave";

@Component({
  selector: 'app-race',
  standalone: true,
  imports: [
    NzPageHeaderComponent,
    AsyncPipe,
    NzTagComponent,
    DatePipe,
    NzSpaceComponent,
    NzPopconfirmDirective,
    NzButtonComponent,
    NzSpaceItemDirective,
    NzDividerComponent,
    NzSpinComponent,
    NzPageHeaderTagDirective,
    NzPageHeaderExtraDirective,
    LeaderboardComponent,
    NzFlexDirective,
    UpperCasePipe
  ],
  templateUrl: './race.component.html',
  styleUrls: ['./race.component.less']
})
export class RaceComponent {

  #raceService = inject(RaceService);

  #route = inject(ActivatedRoute);

  #authService = inject(AuthService);

  #dialogService = inject(NzModalService);

  race$ = this.#route.paramMap.pipe(
    switchMap(params => this.#raceService.getOne(params.get('id')!)),
    shareReplay(1)
  );

  status$ = combineLatest([this.race$, timer(0, 1000)]).pipe(
    map(([race]) => {
      if (race.stopped) {
        return "Stopped"
      }
      return race.start.toMillis() > Date.now() ? 'Planned' : 'Running';
    })
  );

  isAdmin$ = this.#authService.user$.pipe(
    map(user => user.admin)
  );

  userIsTracker$ = this.#authService.userIsTracker$;

  stopRace(race: Race): void {
    this.#raceService.updateOne(race.$key, {stopped: Timestamp.now()});
  }

  registerTeam(race: Race): void {
    this.#dialogService.create({
      nzTitle: "Register teams",
      nzContent: TeamPickerComponent,
      nzData: race,
      nzFooter: null
    }).afterClose.pipe(
      filter(teams => !!teams && teams.length > 0),
      switchMap((teams: Team[]) => this.#raceService.updateOne(race.$key, {teams: arrayUnion(...teams.map(t => t.$key as string))}))
    ).subscribe();
  }
}
