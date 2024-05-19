import {Component, inject} from '@angular/core';
import {NzFormControlComponent, NzFormDirective, NzFormItemComponent, NzFormLabelComponent} from "ng-zorro-antd/form";
import {NzColDirective} from "ng-zorro-antd/grid";
import {NzInputDirective} from "ng-zorro-antd/input";
import {NzOptionComponent, NzSelectComponent} from "ng-zorro-antd/select";
import {FormsModule} from "@angular/forms";
import {NZ_MODAL_DATA, NzModalRef} from "ng-zorro-antd/modal";
import {Race} from "../../model/race";
import {NzDatePickerComponent} from "ng-zorro-antd/date-picker";
import {NzButtonComponent} from "ng-zorro-antd/button";
import {NzDividerComponent} from "ng-zorro-antd/divider";
import {Timestamp} from "@angular/fire/firestore";
import {ClearReportsService} from "../../database/clear-reports.service";
import {first, switchMap} from "rxjs";
import {NzMessageService} from "ng-zorro-antd/message";
import {ClearReport} from "../../model/clear-report";
import {HistoryService} from "../../database/history.service";
import {AuthService} from "../../auth/auth.service";
import {HistoryEntryType, ReportEditEntry} from "../../model/history-entry";

@Component({
  selector: 'app-clear-report-dialog',
  standalone: true,
  imports: [
    NzFormDirective,
    NzFormItemComponent,
    NzFormLabelComponent,
    NzFormControlComponent,
    NzColDirective,
    NzInputDirective,
    NzSelectComponent,
    NzOptionComponent,
    NzDatePickerComponent,
    NzButtonComponent,
    NzDividerComponent,
    FormsModule
  ],
  templateUrl: './clear-report-edit-dialog.component.html',
  styleUrl: './clear-report-edit-dialog.component.less'
})
export class ClearReportEditDialogComponent {
  #reportsService = inject(ClearReportsService);

  #historyService = inject(HistoryService);

  #ref = inject(NzModalRef);

  #message = inject(NzMessageService);

  #authService = inject(AuthService);

  data: { report: ClearReport, race: Race } = inject(NZ_MODAL_DATA);

  date = this.data.report.date.toDate();

  submit(): void {
    this.#reportsService.updateOne(this.data.report.$key, {
      date: Timestamp.fromDate(this.date),
    }).pipe(
      switchMap(() => {
        return this.#authService.user$.pipe(
          first(),
          switchMap((user) => {
            return this.#historyService.addOne({
              author: user.$key || 'unknown',
              date: Timestamp.now(),
              type: HistoryEntryType.REPORT_EDITED,
              report: this.data.report,
              previous_date: this.data.report.date,
              new_date: Timestamp.fromDate(this.date)
            } as ReportEditEntry)
          })
        )
      })
    ).subscribe(() => {
      this.#message.success("Clear report submitted, thanks !");
      this.#ref.close();
    });
  }
}
