import React from 'react';
import {
  WebWalletLoginButton,
} from '@multiversx/sdk-dapp/UI';

const UnlockPage = () => {
  const commonProps = {
    callbackRoute: "/home",
    nativeAuth: true // optional
  };

  return (
    <div className='home d-flex flex-fill align-items-center'>
      <div className='m-auto' data-testid='unlockPage'>
        <div className='card my-4 text-center'>
          <div className='card-body py-4 px-2 px-sm-2 mx-lg-4'>
            <WebWalletLoginButton
              loginButtonText='Web wallet'
              {...commonProps}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export const Unlock = () => (
  <UnlockPage />
);
