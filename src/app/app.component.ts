import { DialogComponent, DialogData } from './../dialog/dialog.component';
import { SocketService, socketServerURL } from './../services/socket.service';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { MediaMatcher } from '@angular/cdk/layout';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { DataService } from 'src/services/data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy, OnInit {
  title = 'ChatUI';

  public socketSubscriptions: Array<Subscription> = new Array<Subscription>();
  public get socketService(): SocketService {
    return this._socketService;
  }


  public get dataService(): DataService {
    return this._dataService
  }

  public async loginSuccess(userName?: string) {
    if (userName) {
      await this._socketService.initSocket(userName);
      this.socketSubscriptions.push(this._socketService.onConnected().subscribe(data => { console.log(data) }));
      this.socketSubscriptions.push(this._socketService.onTestServer().subscribe(data => { console.log(data) }));
      this.socketSubscriptions.push(this._socketService.onServerMessage().subscribe(data => {
        console.log(data);
        this.openSnackBar("[Server] " + data, "Done", 5000);
      }));
      sessionStorage.setItem("userName", userName);
      this.dataService.isLogged = true;
      this.dataService.User = {
        userName: userName
      }
      this.router.navigateByUrl("home");
    }
    else {
      console.log("Username not provided to initialize socket");
    }
  }

  public logOut() {
    this.socketService.disconnect();
    this.socketSubscriptions.forEach(sub => sub.unsubscribe());
    sessionStorage.clear();
    this.dataService.isLogged = false;
    this.dataService.User=null;
    this.router.navigateByUrl("/")
    this.openSnackBar("Logged Out!");
  }

  mobileQuery: MediaQueryList;

  private _mobileQueryListener: () => void;
  constructor(private _dataService: DataService, private _snackBar: MatSnackBar,
    private http: HttpClient, private _socketService: SocketService, changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher, public dialog: MatDialog, private router: Router) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);

  }
  ngOnInit(): void {
    if (sessionStorage.getItem("userName")) {
      this.loginSuccess(sessionStorage.getItem("userName")?.toString());
    }
  }
  ngOnDestroy(): void {
    this.socketSubscriptions.forEach(sub => sub.unsubscribe());
  }

  openDialog(command: string, data?: any): void {
    var ddt: DialogData = new DialogData(command, data);
    var dc: MatDialogConfig = new MatDialogConfig();
    dc.data = ddt;
    if (!this.mobileQuery.matches) {
      dc.width = "250px";
      dc.position = {
        right: "50px",
        top: "80px"
      }
    }
    else {
      dc.width = "80vw";
    }
    const dialogRef = this.dialog.open(DialogComponent, dc);

    dialogRef.afterClosed().subscribe((result: DialogData) => {
      console.log('The dialog was closed ', result);
      // this.animal = result;
      switch (result?.command) {
        case "login":
          var header: HttpHeaders = new HttpHeaders({
            'Content-Type': 'application/json'
          })
          var cred = result.data;
          this.http.post(socketServerURL + "/login", cred, { headers: header }).subscribe(async (res: any) => {
            console.log(res);
            if (res.success) {
              this.loginSuccess(cred.userName);
            }
          });
          break;

        default:
          break;
      }
    });
  }

  openSnackBar(message: string, action: string = "Ok", duration: number = 3000,
    horizontalPosition: MatSnackBarHorizontalPosition = 'right',
    verticalPosition: MatSnackBarVerticalPosition = 'bottom') {
    this._snackBar.open(message, action, {
      duration: duration,
      horizontalPosition: horizontalPosition,
      verticalPosition: verticalPosition,
    });
  }

}
