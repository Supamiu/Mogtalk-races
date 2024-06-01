import {Component, inject} from '@angular/core';
import {ClearReportsService} from "../database/clear-reports.service";
import {NzPageHeaderComponent} from "ng-zorro-antd/page-header";
import {NzListComponent, NzListItemComponent, NzListItemMetaComponent} from "ng-zorro-antd/list";
import {AsyncPipe, DatePipe} from "@angular/common";
import {NzTableModule} from "ng-zorro-antd/table";
import {first, map, shareReplay, switchMap} from "rxjs";
import {ClearReport} from "../model/clear-report";
import {NzSpinComponent} from "ng-zorro-antd/spin";
import {NzButtonComponent} from "ng-zorro-antd/button";
import {NzIconDirective} from "ng-zorro-antd/icon";
import {NzSpaceComponent, NzSpaceItemDirective} from "ng-zorro-antd/space";
import {NzPopconfirmDirective} from "ng-zorro-antd/popconfirm";
import {HistoryService} from "../database/history.service";
import {AuthService} from "../auth/auth.service";
import {arrayUnion, Timestamp} from "@angular/fire/firestore";
import {HistoryEntryType} from "../model/history-entry";
import {NzTooltipDirective} from "ng-zorro-antd/tooltip";
import {NzOptionComponent, NzSelectComponent} from "ng-zorro-antd/select";
import {ReportPhasesPipe} from "./report-phases.pipe";
import {FormsModule} from "@angular/forms";
import {NzTagComponent} from "ng-zorro-antd/tag";
import {TeamsService} from "../database/teams.service";
import {REGION_PER_DC} from "../core/game-data";
import {RaceService} from "../database/race.service";

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    NzPageHeaderComponent,
    NzListComponent,
    AsyncPipe,
    NzListItemComponent,
    NzListItemMetaComponent,
    NzTableModule,
    NzSpinComponent,
    DatePipe,
    NzButtonComponent,
    NzIconDirective,
    NzSpaceComponent,
    NzSpaceItemDirective,
    NzPopconfirmDirective,
    NzTooltipDirective,
    NzSelectComponent,
    ReportPhasesPipe,
    NzOptionComponent,
    FormsModule,
    NzTagComponent,
  ],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.less'
})
export class ReportsComponent {

  #authService = inject(AuthService);

  #reportsService = inject(ClearReportsService);

  #historyService = inject(HistoryService);

  #teamsService = inject(TeamsService);

  #raceService = inject(RaceService);

  reports$ = this.#reportsService.pending$.pipe(
    shareReplay(1)
  );

  user$ = this.#authService.user$;

  editedPhase?: string;

  columns$ = this.reports$.pipe(
    map(reports => {
      return [
        {
          name: 'Race',
          filterFn: (value: string[], report: ClearReport) => value.includes(report.raceName),
          possibleValues: [...new Set(reports.map(report => report.raceName))].map(
            name => {
              return {
                value: name,
                text: name
              }
            }
          )
        },
        {
          name: 'Phase'
        },
        {
          name: 'Team',
          filterFn: (value: string[], report: ClearReport) => value.includes(report.teamName),
          possibleValues: [...new Set(reports.map(report => report.teamName))].map(
            name => {
              return {
                value: name,
                text: name
              }
            }
          )
        },
        {
          name: 'Time',
          comparator: (a: ClearReport, b: ClearReport) => a.date.toMillis() - b.date.toMillis(),
        },
        {
          name: 'Screenshot'
        }
      ]
    })
  );

  accept(report: ClearReport) {
    this.user$.pipe(
      first(),
      switchMap(user => {
        const historyAddition$ = this.#historyService.addOne({
          date: Timestamp.now(),
          type: HistoryEntryType.REPORT_ACCEPTED,
          author: user.$key || 'unknown',
          report
        });
        if (report.customTeam) {
          return this.#teamsService.addOne({
            name: report.customTeam.name,
            datacenter: report.customTeam.datacenter,
            region: REGION_PER_DC[report.customTeam.datacenter],
            streams: report.customTeam.streams,
            previousNames: []
          }).pipe(
            switchMap((teamKey) => {
              report.team = teamKey;
              return this.#raceService.updateOne(report.race, {
                teams: arrayUnion(teamKey)
              }).pipe(
                switchMap(() => historyAddition$),
                map(() => {
                  return {
                    accepted: true,
                    team: teamKey
                  }
                })
              )
            })
          );
        }
        return historyAddition$.pipe(
          map(() => {
            return {
              accepted: true
            }
          })
        );
      }),
      switchMap((update) => {
        return this.#reportsService.updateOne(report.$key, update);
      })
    ).subscribe()
  }

  reject(report: ClearReport) {
    this.user$.pipe(
      first(),
      switchMap(user => {
        return this.#historyService.addOne({
          date: Timestamp.now(),
          type: HistoryEntryType.REPORT_REJECTED,
          author: user.$key || 'unknown',
          report
        })
      }),
      switchMap(() => {
        return this.#reportsService.deleteOne(report.$key as string)
      })
    ).subscribe();
  }

  setReportPhase(report: ClearReport) {
    this.user$.pipe(
      first(),
      switchMap(user => {
        return this.#historyService.addOne({
          date: Timestamp.now(),
          type: HistoryEntryType.REPORT_EDITED,
          author: user.$key || 'unknown',
          report
        })
      }),
      switchMap(() => {
        return this.#reportsService.updateOne(report.$key as string, {
          phase: report.phase
        })
      })
    ).subscribe(() => {
      delete this.editedPhase;
    });
  }
}
