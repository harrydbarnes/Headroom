import {it,expect} from 'vitest';
import {PairingTickets} from '../server/pairing';
it('issues high-entropy tickets that can be consumed only once',()=>{const tickets=new PairingTickets();const a=tickets.issue(),b=tickets.issue();expect(a).toMatch(/^[A-Za-z0-9_-]{43}$/);expect(a).not.toBe(b);expect(tickets.consume(a)).toBe(true);expect(tickets.consume(a)).toBe(false);expect(tickets.consume('wrong')).toBe(false);});
it('expires pairing tickets after two minutes',()=>{let now=100;const tickets=new PairingTickets(()=>now),ticket=tickets.issue();now+=120000;expect(tickets.consume(ticket)).toBe(false);});
