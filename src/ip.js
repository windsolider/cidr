import {ipv4Reg,ipv4CidrReg,ipv6Reg,ipv6CidrReg} from './constants.js';


export function simplifyIpv6(ipv6) {
    let parts = ipv6.split(':');
    parts = parts.map(part => part.replace(/^0+/, '') || '0');
    let longestZeroSequence = '';
    let longestIndex = -1;
    for (let i = 0; i < parts.length; i++) {
        if (parts[i] === '0') {
            let sequence = '';
            while (i < parts.length && parts[i] === '0') {
                sequence += parts[i];
                i++;
            }
            if (sequence.length > longestZeroSequence.length) {
                longestZeroSequence = sequence;
                longestIndex = i - sequence.length;
            }
        }
    }
    if (longestIndex !== -1) {
        parts.splice(longestIndex, longestZeroSequence.length, '');
    }
    let simplified = parts.join(':');
    if (simplified.startsWith(':')) {
        simplified = simplified.replace(':::', '::');
    }
    if (simplified.includes(':') && simplified.includes('::')) {
        simplified = simplified.replace(':::', '::');
    }
    return simplified;
}

export function expandIpv6(ipv6) {
    let parts = ipv6.split(':');
    const doubleColonIndex = parts.indexOf('');
    if (doubleColonIndex !== -1) {
        const missingPartsCount = 8 - parts.filter(part => part !== '').length;
        parts.splice(doubleColonIndex, 1, ...Array(missingPartsCount).fill('0000'));
    }
    parts = parts.map(part => part.padStart(4, '0'));
    return parts.join(':');
}

class IPv6 {
    constructor() {

    }

    isIPv4(val) {
        return ipv4Reg.test(val);
    }
    isIPv4Cidr(val) {
        return ipv4CidrReg.test(val);
    }
    isIPv6(val) {
        return ipv6Reg.test(val);
    }
    isIpv6Cidr(val) {
        return ipv6CidrReg.test(val);
    }
    abbreviate(val) {
        if (!ipv6Reg.test(val)) {
            throw new Error('Invalid IP address.');
        }
        return simplifyIpv6(val)
    }
    expand(val) {
        if (!ipv6Reg.test(val)) {
            throw new Error('Invalid IP address.');
        }
        return expandIpv6(val)
    }
    ipv4Range(ipv4Cidr) {
        if (!ithis.isIPv4Cidr(ipv4Cidr)) {
            throw new Error('Invalid IP address.');
        }
        let [ip, prefix] = ipv4Cidr.split('/');
        let prefixLength = parseInt(prefix, 10);
        console.log(typeof prefixLength)
        if (isNaN(prefixLength) || prefixLength < 0 || prefixLength > 32) {
            throw new Error('Invalid prefix length');
        }
        
        let ipParts = ip.split('.').map(Number);
        let maskParts = [];
        for (let i = 0; i < 4; i++) {
            maskParts.push(prefixLength >= 8 ? 255 : (prefixLength > 0 ? (256 - Math.pow(2, 8 - prefixLength)) : 0));
            prefixLength -= 8;
        }
        
        let networkIp = ipParts.map((part, index) => part & maskParts[index]);
        let broadcastIp = ipParts.map((part, index) => part | (255 - maskParts[index]));
        let availableHosts = Math.pow(2, 32 - prefixLength) - 2;
        
        return {
            ipv4Cidr,
            networkIp: `${networkIp.join('.')}`,
            broadcastIp: `${broadcastIp.join('.')}`,
            availableHosts
        }
    }

}

