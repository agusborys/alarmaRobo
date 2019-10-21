import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private AFauth : AngularFireAuth) { }

  public SignIn(email:string, pass:string)
  {
    return this.AFauth.auth.signInWithEmailAndPassword(email, pass);
  }
  public LogOut() 
  {
    return this.AFauth.auth.signOut();
  }
}
