import {Component, inject} from '@angular/core';
import {NzFormControlComponent, NzFormDirective, NzFormItemComponent, NzFormLabelComponent} from "ng-zorro-antd/form";
import {NzColDirective} from "ng-zorro-antd/grid";
import {NzInputDirective} from "ng-zorro-antd/input";
import {NzOptionComponent, NzSelectComponent} from "ng-zorro-antd/select";
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {NZ_MODAL_DATA, NzModalRef} from "ng-zorro-antd/modal";
import {Team} from "../../model/team";
import {Race} from "../../model/race";
import {NzDatePickerComponent} from "ng-zorro-antd/date-picker";
import {NzButtonComponent} from "ng-zorro-antd/button";
import {NzDividerComponent} from "ng-zorro-antd/divider";
import {Timestamp} from "@angular/fire/firestore";
import {getDownloadURL, ref, Storage, uploadBytes} from "@angular/fire/storage";
import {ClearReportsService} from "../../database/clear-reports.service";
import {Observable, switchMap, withLatestFrom} from "rxjs";
import {NzMessageService} from "ng-zorro-antd/message";
import {AuthService} from "../../auth/auth.service";
import {ClearReport} from "../../model/clear-report";

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

  #ref = inject(NzModalRef);

  #message = inject(NzMessageService);

  data: { report: ClearReport, race: Race } = inject(NZ_MODAL_DATA);

  date = this.data.report.date.toDate();

  submit(): void {
    this.#reportsService.updateOne(this.data.report.$key, {
      date: Timestamp.fromDate(this.date),
    }).subscribe(() => {
      this.#message.success("Clear report submitted, thanks !");
      this.#ref.close();
    });
  }
}
