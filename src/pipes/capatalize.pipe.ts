import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'capatalize'
})
export class CapatalizePipe implements PipeTransform {

  transform(value?: string): string {
    console.log(value);
    if (value) {
      var val = value.charAt(0);
      val = val.toLocaleUpperCase() + value.substring(1, value.length);
      return val;
    }
    return "Error empty string passed"
  }

}
