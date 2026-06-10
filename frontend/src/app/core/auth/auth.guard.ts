import { CanActivateFn } from '@angular/router';

// Der Türsteher fürs Frontend — gleiche Idee wie dein RolesGuard im Backend,
// nur dass Angular-Guards einfache Funktionen sind (CanActivateFn).
//
// TODO(Pascal): authGuard — ca. 4 Zeilen + 2 Imports:
//   0) Oben dazu-importieren (sonst meckert der Lint über ungenutzte Imports,
//      deshalb fehlen sie hier noch):
//      import { inject } from '@angular/core';
//      und Router mit in die Klammer der ersten Import-Zeile: { CanActivateFn, Router }
//      import { AuthService } from './auth.service';
//   1) Im Funktions-Body AuthService und Router holen:
//      const auth = inject(AuthService);
//      const router = inject(Router);
//   2) Wenn auth.isLoggedIn() → true zurückgeben (Tür auf).
//   3) Sonst eine "Umleitung" zurückgeben statt false:
//      return router.createUrlTree(['/login']);
//      (Eine UrlTree sagt dem Router: "nicht rein — DAHIN stattdessen.")
export const authGuard: CanActivateFn = () => {
  return true;
};
