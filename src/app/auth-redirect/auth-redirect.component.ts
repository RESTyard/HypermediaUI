import {Component} from '@angular/core';
import {AuthService} from '../hypermedia-view/auth.service';
import {Router} from '@angular/router';
import {ProblemDetailsError} from '../error-dialog/problem-details-error';

@Component({
  selector: 'app-auth-redirect',
  templateUrl: './auth-redirect.component.html',
  styleUrls: ['./auth-redirect.component.css']
})
export class AuthRedirectComponent {
  constructor(
    private authService: AuthService,
    private router: Router) {

  }

  ngOnInit() {

    let targetEntryPoint = new URL(window.location.href).searchParams.get("api_path");

    if (!targetEntryPoint) {
      throw new ProblemDetailsError();
    }

    this.authService.handleCallback(targetEntryPoint)
      .then(success =>
        success.match(
          _ => this.router.navigate(['hui'], {
            replaceUrl: true,
            queryParams: {
                apiPath: targetEntryPoint
              }
            }
          ),
          error => {
            throw new ProblemDetailsError({
              type: "ApiError",
              title: "API error",
              detail: error,
              status: 401,
            })
          }
        ));
  }
}
