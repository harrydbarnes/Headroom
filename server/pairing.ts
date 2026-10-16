import {randomBytes} from 'node:crypto';
/** In-memory, short-lived, one-use handoff. Never persist or log tickets. */
export class PairingTickets{
 private tickets=new Map<string,number>();
 constructor(private now=()=>Date.now()){}
 issue(){for(const [key,time] of this.tickets)if(this.now()-time>=120000)this.tickets.delete(key);if(this.tickets.size>=100)throw Error('Too many outstanding pairing tickets.');const ticket=randomBytes(32).toString('base64url');this.tickets.set(ticket,this.now());return ticket;}
 consume(ticket:unknown){if(typeof ticket!=='string'||!/^[A-Za-z0-9_-]{43}$/.test(ticket))return false;const created=this.tickets.get(ticket);this.tickets.delete(ticket);return created!==undefined&&this.now()-created>=0&&this.now()-created<120000;}
}
