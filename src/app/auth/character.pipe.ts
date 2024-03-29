import {inject, Pipe, PipeTransform} from '@angular/core';
import {Observable, of} from "rxjs";
import {UsersService} from "../database/users.service";

@Pipe({
  name: 'character',
  standalone: true
})
export class CharacterPipe implements PipeTransform {

  #usersService = inject(UsersService);

  transform(value: number | undefined | null): Observable<any> {
    if (value) {
      return this.#usersService.getCharacter(Number(value));
    }
    return of({notFound: true});
  }

}
