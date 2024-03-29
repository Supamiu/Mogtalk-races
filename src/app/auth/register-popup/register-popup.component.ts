import {Component, inject, signal} from '@angular/core';
import {NzButtonComponent} from "ng-zorro-antd/button";
import {NzInputDirective, NzInputGroupComponent} from "ng-zorro-antd/input";
import {NzFormControlComponent, NzFormDirective, NzFormItemComponent, NzFormLabelComponent} from "ng-zorro-antd/form";
import {AsyncValidatorFn, FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators} from "@angular/forms";
import {AuthService} from "../auth.service";
import {NzModalRef} from "ng-zorro-antd/modal";
import {HttpClient} from "@angular/common/http";
import {catchError, map, of, Subject, switchMap, tap} from "rxjs";
import {AsyncPipe, NgIf} from "@angular/common";
import {NzDividerComponent} from "ng-zorro-antd/divider";
import {NzAlertComponent} from "ng-zorro-antd/alert";
import {UsersService} from "../../database/users.service";

@Component({
  selector: 'app-register-popup',
  standalone: true,
  imports: [
    NzButtonComponent,
    NzInputGroupComponent,
    NzFormControlComponent,
    NzFormItemComponent,
    ReactiveFormsModule,
    NzFormDirective,
    NzFormLabelComponent,
    NzInputDirective,
    AsyncPipe,
    NgIf,
    NzDividerComponent,
    NzAlertComponent
  ],
  templateUrl: './register-popup.component.html',
  styleUrl: './register-popup.component.less'
})
export class RegisterPopupComponent {
  #authService = inject(AuthService);
  #ref = inject(NzModalRef);
  #usersService = inject(UsersService);

  characterDisplay = signal<{ name: string, server: string } | null>(null);

  error$ = new Subject<string>();

  passwordValidator: ValidatorFn = control => {
    return control.value.password === control.value.passwordRepeat ? null : {passwordMissmatch: true};
  }

  lodestoneIdValidator: AsyncValidatorFn = control => {
    const id = control.value;
    if (id.toString().length >= 7 && id.toString().length <= 8) {
      return this.#usersService.getCharacter(id).pipe(
        tap(c => {
          this.characterDisplay.set({
            name: c.Character.Name,
            server: c.Character.World
          });
        }),
        catchError(err => {
          return of({lodestoneId: true})
        }),
        map(() => null)
      )
    }
    return of({lodestoneId: true});
  }

  form = new FormGroup({
    email: new FormControl<string>('', [Validators.required, Validators.email]),
    lodestoneId: new FormControl<number | null>(null, [Validators.required, Validators.minLength(7), Validators.maxLength(8)], [this.lodestoneIdValidator]),
    password: new FormControl('', [Validators.required]),
    passwordRepeat: new FormControl('', [Validators.required]),
  }, [this.passwordValidator]);

  register(): void {
    const {email, password, lodestoneId} = this.form.getRawValue();
    if (email && password && lodestoneId) {
      this.#authService.registerWithEmail(email, password, lodestoneId).pipe(
        switchMap(() => {
          return this.#authService.loginWithEmail(email, password)
        })
      ).subscribe({
        next: () => {
          this.#ref.close();
        },
        error: err => {
          this.error$.next(err.code);
        }
      });
    }
  }
}
