import { RouteGuardService } from './../services/route-guard.service';
import { NgModule } from '@angular/core';
import { RouterModule, Routes, CanActivate } from '@angular/router';
import { HomeComponent } from 'src/home/home.component';

const routes: Routes = [
  {path:"home",component:HomeComponent,canActivate:[RouteGuardService]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
