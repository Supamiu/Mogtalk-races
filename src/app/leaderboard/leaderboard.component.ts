import {Component, EventEmitter, inject, input, Output} from '@angular/core';
import {Race} from "../model/race";
import {toObservable} from "@angular/core/rxjs-interop";
import {filter, map, Observable, of, switchMap} from "rxjs";
import {Team} from "../model/team";
import {arrayRemove, documentId, where} from "@angular/fire/firestore";
import {TeamsService} from "../database/teams.service";
import {RaceService} from "../database/race.service";
import {NzSpinComponent} from "ng-zorro-antd/spin";
import {AsyncPipe} from "@angular/common";
import {NzEmptyComponent} from "ng-zorro-antd/empty";
import {NzTableModule, NzThAddOnComponent} from "ng-zorro-antd/table";
import {AuthService} from "../auth/auth.service";
import {NzButtonComponent} from "ng-zorro-antd/button";
import {NzPopconfirmDirective} from "ng-zorro-antd/popconfirm";
import {NzIconDirective} from "ng-zorro-antd/icon";
import {DATACENTERS, REGION_PER_DC} from "../core/game-data";
import {LeaderboardEntry} from "./leaderboard-entry";
import {NzModalService} from "ng-zorro-antd/modal";
import {ClearReportDialogComponent} from "./clear-report/clear-report-dialog.component";

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [
    NzSpinComponent,
    AsyncPipe,
    NzEmptyComponent,
    NzTableModule,
    NzThAddOnComponent,
    NzButtonComponent,
    NzPopconfirmDirective,
    NzIconDirective
  ],
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.less'
})
export class LeaderboardComponent {

  #teamsService = inject(TeamsService);

  #raceService = inject(RaceService);

  #authService = inject(AuthService);

  #dialog = inject(NzModalService);

  race = input<Race>();

  race$ = toObservable(this.race).pipe(
    filter(Boolean)
  );

  raceIsRunning$ = this.race$.pipe(
    map(race => !race.stopped && race.start.toMillis() < Date.now())
  );

  @Output()
  registerTeam = new EventEmitter<void>();

  userIsTracker$ = this.#authService.userIsTracker$;

  columns$ = this.race$.pipe(
    map(race => {
      return [
        {
          name: '#',
          comparator: (a: any, b: any) => a.rank - b.rank,
          priority: 2
        },
        {
          name: "Team Name",
          comparator: (a: Team, b: Team) => a.name.localeCompare(b.name),
          priority: 3
        },
        {
          name: "Datacenter",
          comparator: (a: Team, b: Team) => a.datacenter.localeCompare(b.datacenter),
          possibleValues: DATACENTERS.map(value => {
            return {
              value,
              text: value
            }
          }),
          filterFn: (options: string[], team: Team) => options.includes(team.datacenter),
          priority: 3
        },
        {
          name: "Region",
          possibleValues: [...new Set(Object.values(REGION_PER_DC))].map(value => {
            return {
              value,
              text: value
            }
          }),
          filterFn: (options: string[], team: Team) => options.includes(team.region),
          comparator: (a: Team, b: Team) => a.region.localeCompare(b.region),
          priority: 3
        },
        ...(race.phases.length > 0 ? race.phases.map((phase, i) => {
          return {
            name: phase,
            comparator: (a: any, b: any) => a.phases[i] - b.phases[i],
            priority: 1
          }
        }) : [{
          name: 'Clear',
          comparator: (a: any, b: any) => a.phases[0] - b.phases[0],
          priority: 1
        }]),
        {
          name: "Stream",
          comparator: (a: Team, b: Team) => a.twitchLink?.localeCompare(b.twitchLink || '') || 0,
          priority: Infinity
        },
      ];
    })
  );

  teams$: Observable<LeaderboardEntry[]> = this.race$.pipe(
    switchMap(race => {
      if (race.teams.length > 0) {
        return this.#teamsService.query(where(documentId(), 'in', race.teams))
      }
      return of([]);
    }),
    map(teams => {
      // TODO proper ranking here
      return teams.map((team, i) => {
        return {
          ...team,
          rank: i + 1,
          clears: []
        }
      })
    })
  );

  openReportForm(teams: Team[]): void {
    this.#dialog.create({
      nzContent: ClearReportDialogComponent,
      nzData: {
        race: this.race(),
        teams
      },
      nzTitle: 'Report clear/progress',
      nzFooter: null
    });
  }

  withdrawTeam(race: Race, team: Team): void {
    this.#raceService.updateOne(race.$key, {teams: arrayRemove(team.$key)});
  }

}
