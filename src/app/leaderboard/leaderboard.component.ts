import {Component, EventEmitter, inject, input, Output} from '@angular/core';
import {Race} from "../model/race";
import {toObservable} from "@angular/core/rxjs-interop";
import {combineLatest, filter, map, Observable, of, switchMap} from "rxjs";
import {Team} from "../model/team";
import {arrayRemove, documentId, where} from "@angular/fire/firestore";
import {TeamsService} from "../database/teams.service";
import {RaceService} from "../database/race.service";
import {NzSpinComponent} from "ng-zorro-antd/spin";
import {AsyncPipe, DatePipe} from "@angular/common";
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
import {ClearReportsService} from "../database/clear-reports.service";
import {NzDividerComponent} from "ng-zorro-antd/divider";
import {ClearReport} from "../model/clear-report";
import {ClearReportEditDialogComponent} from "./clear-report-edit/clear-report-edit-dialog.component";
import {NzTooltipDirective} from "ng-zorro-antd/tooltip";
import {NzSpaceComponent, NzSpaceItemDirective} from "ng-zorro-antd/space";
import {RouterLink} from "@angular/router";
import {NzFlexDirective} from "ng-zorro-antd/flex";

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
    NzIconDirective,
    DatePipe,
    NzDividerComponent,
    NzTooltipDirective,
    NzSpaceComponent,
    NzSpaceItemDirective,
    RouterLink,
    NzFlexDirective
  ],
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.less'
})
export class LeaderboardComponent {

  #teamsService = inject(TeamsService);

  #reportsService = inject(ClearReportsService);

  #raceService = inject(RaceService);

  #authService = inject(AuthService);

  #dialog = inject(NzModalService);

  race = input<Race>();

  homeDisplay = input<boolean>()

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
            comparator: (a: any, b: any) => (a.clears[i]?.getTime() || Infinity) - (b.clears[i]?.getTime() || Infinity),
            priority: 1
          }
        }) : [{
          name: 'Clear',
          comparator: (a: any, b: any) => (a.clears[0]?.getTime() || Infinity) - (b.clears[0]?.getTime() || Infinity),
          priority: 1
        }]),
        {
          name: "Stream",
          comparator: (a: Team, b: Team) => a.streams?.[0]?.localeCompare(b.streams?.[0] || '') || 0,
          priority: Infinity
        },
      ];
    })
  );

  reports$ = this.race$.pipe(
    switchMap(race => {
      return this.#reportsService.query(where('race', '==', race.$key), where('accepted', '==', true));
    })
  );

  teams$: Observable<LeaderboardEntry[]> = combineLatest([this.race$, this.reports$]).pipe(
    switchMap(([race, reports]) => {
      if (race.teams.length > 0) {
        return this.#teamsService.query(where(documentId(), 'in', race.teams)).pipe(
          map(teams => {
            return teams
              .map((team, i) => {
                const teamClears = reports.filter(report => report.team === team.$key);
                let clearsDisplay: Array<{ date: Date, clear: ClearReport } | undefined> = teamClears.map(clear => {
                  return {
                    date: clear.date.toDate(),
                    clear
                  }
                });
                if (race.phases.length > 0) {
                  clearsDisplay = race.phases.map(phase => {
                    const clear = teamClears.find(clear => clear.phase === phase);
                    if(clear){
                      return {
                        date: clear.date.toDate(),
                        clear
                      };
                    }
                    return undefined;
                  });
                }
                return {
                  ...team,
                  clears: clearsDisplay,
                }
              })
              .sort((a, b) => {
                const aClears = [...a.clears].reverse();
                const bClears = [...b.clears].reverse();
                // Find first non-undefined clear
                const lastAClear = aClears.findIndex(Boolean);
                const lastBClear = bClears.findIndex(Boolean);
                if (lastAClear === -1) {
                  return 1;
                }
                if (lastBClear === -1) {
                  return -1;
                }
                if (lastAClear === lastBClear) {
                  return aClears[lastAClear]?.date?.getTime()! - bClears[lastBClear]?.date?.getTime()!;
                }
                return lastAClear - lastBClear;
              })
              .map((team, i) => {
                return {
                  ...team, rank: i + 1
                }
              })
          })
        )
      }
      return of([]);
    }),
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

  editReport(clear: ClearReport): void {
    this.#dialog.create({
      nzContent: ClearReportEditDialogComponent,
      nzData: {
        race: this.race(),
        report: clear
      },
      nzTitle: 'Report clear/progress',
      nzFooter: null
    });
  }

  deleteReport(clear: ClearReport): void {
    this.#reportsService.deleteOne(clear.$key!).subscribe();
  }

}
