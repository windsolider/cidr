import {RE_IPV4,RE_IPV4_CIDR,RE_IPV6,RE_IPV6_CIDR} from './constants.js';


function simplifyIpv6(ipv6) {
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

function expandIpv6(ipv6) {
    let parts = ipv6.split(':');
    const doubleColonIndex = parts.indexOf('');
    if (doubleColonIndex !== -1) {
        const missingPartsCount = 8 - parts.filter(part => part !== '').length;
        parts.splice(doubleColonIndex, 1, ...Array(missingPartsCount).fill('0000'));
    }
    parts = parts.map(part => part.padStart(4, '0'));
    return parts.join(':');
}

class CIDR {
    constructor() {

    }

    isIPv4(val) {
        return RE_IPV4.test(val);
    }
    isIPv4Cidr(val) {
        if(typeof val !== 'string') {
            throw new Error('Invalid input.');
        }
        if (!RE_IPV4_CIDR.test(val)) {
            throw new Error('Invalid IP address.');
        }
        let [ip, prefix] = val.split('/');
        let prefixLength = parseInt(prefix, 10);

        if (!RE_IPV4.test(ip)) {
            throw new Error('Invalid IP address.');
        }
        if (prefixLength<0 || prefixLength > 32) {
            throw new Error('Invalid Cidr.');
        }

        return this.maskMatch(val);
    }
    isIPv6(val) {
        return RE_IPV6.test(val);
    }
    isIpv6Cidr(val) {
        return RE_IPV6_CIDR.test(val);
    }
    abbreviate(val) {
        if (!RE_IPV6.test(val)) {
            console.error('Invalid IP address.')
        }
        return simplifyIpv6(val)
    }
    maskMatch(value){
        let [ip, prefix] = value.split('/');
        let ipStr = ip.split('.').map(item =>{
            return parseInt(item,10).toString(2).padStart(8, '0')
        }).reduce((init,next) => init + next);
        let localLast = ipStr.lastIndexOf(1) + 1;
        if (prefix < localLast) {
            console.log('网段IP地址与掩码不匹配')
            return false;
        } else {
            console.log('网段IP地址与掩码匹配')
            return true;
        }
    }
    expand(val) {
        if (!RE_IPV6.test(val)) {
            throw new Error('Invalid IP address.');
        }
        return expandIpv6(val)
    }
    ipv4Range(ipv4Cidr) {
        if (!ithis.isIPv4Cidr(ipv4Cidr)) {
            throw new Error('Invalid IP address.');
        }
        if (!this.maskMatch) {
            throw new Error('The network segment IP address and mask do not match.')
        }
        let [ip, prefix] = ipv4Cidr.split('/');
        let prefixLength = parseInt(prefix, 10);
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

export default CIDR;

