import {Component, inject} from '@angular/core';
import {ClearReportsService} from "../database/clear-reports.service";
import {NzPageHeaderComponent} from "ng-zorro-antd/page-header";
import {NzListComponent, NzListItemComponent, NzListItemMetaComponent} from "ng-zorro-antd/list";
import {AsyncPipe, DatePipe} from "@angular/common";
import {NzTableModule} from "ng-zorro-antd/table";
import {map, shareReplay} from "rxjs";
import {ClearReport} from "../model/clear-report";
import {NzSpinComponent} from "ng-zorro-antd/spin";
import {NzButtonComponent} from "ng-zorro-antd/button";
import {NzIconDirective} from "ng-zorro-antd/icon";
import {NzSpaceComponent, NzSpaceItemDirective} from "ng-zorro-antd/space";
import {NzPopconfirmDirective} from "ng-zorro-antd/popconfirm";

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
  ],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.less'
})
export class ReportsComponent {

  #reportsService = inject(ClearReportsService);

  reports$ = this.#reportsService.pending$.pipe(
    shareReplay(1)
  );

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
    this.#reportsService.updateOne(report.$key, {
      accepted: true
    });
  }

  reject(report: ClearReport) {
    this.#reportsService.deleteOne(report.$key as string).subscribe();
  }
}
