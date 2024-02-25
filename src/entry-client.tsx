import { mount, StartClient } from '@solidjs/start/client';

const mountTarget = document.getElementById('app');

if (!mountTarget)
	throw new Error('No HTMLElement with an "app" id attribute to mount on!');
mount(() => <StartClient />, mountTarget);
