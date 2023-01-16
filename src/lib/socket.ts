import { connect } from 'socket.io-client';

export const socket = connect(location.href.replace('5173', '3000'), {
	transports: ['websocket']
});
