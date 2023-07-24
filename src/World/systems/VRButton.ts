import { WebGLRenderer } from 'three';

export class VRButton {
  static createButton(renderer: WebGLRenderer): Promise<HTMLElement> {
    return new Promise<HTMLElement>((resolve,reject)=>{







      if ( 'xr' in navigator ) {



        navigator.xr.isSessionSupported( 'immersive-vr' ).then( function ( supported ) {

          if(supported){
            const button = document.createElement( 'button' );
            button.id = 'VRButton';
            button.style.display = 'none';
            button.style.position = 'absolute';
            button.style.bottom = '20px';
            button.style.padding = '12px 6px';
            button.style.border = '1px solid #fff';
            button.style.borderRadius = '4px';
            button.style.background = 'rgba(0,0,0,0.1)';
            button.style.color = '#fff';
            button.style.font = 'normal 13px sans-serif';
            button.style.textAlign = 'center';
            button.style.opacity = '0.5';
            button.style.outline = 'none';
            button.style.zIndex = '999';


            let currentSession = null;

            async function onSessionStarted( session ) {

              session.addEventListener( 'end', onSessionEnded );

              await renderer.xr.setSession( session );
              button.textContent = 'EXIT VR';

              currentSession = session;

            }

            function onSessionEnded( /*event*/ ) {

              currentSession.removeEventListener( 'end', onSessionEnded );

              button.textContent = 'ENTER VR';

              currentSession = null;

            }

            //

            button.style.display = '';

            button.style.cursor = 'pointer';
            button.style.left = 'calc(50% - 50px)';
            button.style.width = '100px';

            button.textContent = 'ENTER VR';

            button.onmouseenter = function () {

              button.style.opacity = '1.0';

            };

            button.onmouseleave = function () {

              button.style.opacity = '0.5';

            };

            button.onclick = function () {

              if ( currentSession === null ) {

                // WebXR's requestReferenceSpace only works if the corresponding feature
                // was requested at session creation time. For simplicity, just ask for
                // the interesting ones as optional features, but be aware that the
                // requestReferenceSpace call will fail if it turns out to be unavailable.
                // ('local' is always available for immersive sessions and doesn't need to
                // be requested separately.)

                const sessionInit = { optionalFeatures: [ 'local-floor', 'bounded-floor', 'hand-tracking', 'layers' ] };
                navigator.xr.requestSession( 'immersive-vr', sessionInit ).then( onSessionStarted );

              } else {

                currentSession.end();

              }

            };


            if (VRButton.xrSessionIsGranted ) {
              button.click();
            }
            resolve(button)
          }else{
            reject('VR NOT SUPPORTED')
          }


        } ).catch( (e)=>{
          reject(e);
        } );


      } else {


        if ( window.isSecureContext === false ) {

          reject('WEBXR NEEDS HTTPS');

        } else {

          reject('WEBXR NOT AVAILABLE');

        }



      }

    })



  }

  static xrSessionIsGranted = false;

  static registerSessionGrantedListener() {

    if ( 'xr' in navigator ) {

      // WebXRViewer (based on Firefox) has a bug where addEventListener
      // throws a silent exception and aborts execution entirely.
      if ( /WebXRViewer\//i.test( navigator.userAgent ) ) return;

      navigator.xr.addEventListener( 'sessiongranted', () => {

        VRButton.xrSessionIsGranted = true;

      } );

    }

  }
}

VRButton.registerSessionGrantedListener();
