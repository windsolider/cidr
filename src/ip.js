//子网掩码正则
export const subnetCidrReg = /^(254|252|248|240|224|192|128)\.0\.0\.0|255\.(254|252|248|240|224|192|128|0)\.0\.0|255\.255\.(254|252|248|240|224|192|128|0)\.0|255\.255\.255\.(255|254|252|248|240|224|192|128|0)$/;
//网址(URL)正则
export const urlReg = /^(((ht|f)tps?):\/\/)?([^!@#$%^&*?.\s-]([^!@#$%^&*?.\s]{0,63}[^!@#$%^&*?.\s])?\.)+[a-z]{2,6}\/?/;
//IPV4正则
export const ipv4Reg = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;
//IPV6正则
export const ipv6Reg = /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/;
//MAC地址正则
export const macAddressReg = /[A-F\d]{2}:[A-F\d]{2}:[A-F\d]{2}:[A-F\d]{2}:[A-F\d]{2}:[A-F\d]{2}/;
//端口号正则
export const portReg = /^([0-9]|[1-9]\d|[1-9]\d{2}|[1-9]\d{3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/;
//域名正则
export const domainReg = /^([a-zA-Z0-9]([a-zA-Z0-9-_]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,11}$/;


export function simplifyIpv6(ipv6) {
    // 将 IPv6 地址按照冒号分割成数组
    let parts = ipv6.split(':');

    // 压缩前导零
    parts = parts.map(part => part.replace(/^0+/, '') || '0');

    // 查找最长的连续零字段
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

    // 替换最长的连续零字段
    if (longestIndex !== -1) {
        parts.splice(longestIndex, longestZeroSequence.length, '');
    }

    // 重新组装简化后的 IPv6 地址
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
    // 将 IPv6 地址按照冒号分割成数组
    let parts = ipv6.split(':');

    // 替换双冒号 `::`
    const doubleColonIndex = parts.indexOf('');
    if (doubleColonIndex !== -1) {
        const missingPartsCount = 8 - parts.filter(part => part !== '').length;
        parts.splice(doubleColonIndex, 1, ...Array(missingPartsCount).fill('0000'));
    }

    // 补全每个部分为4位十六进制数
    parts = parts.map(part => part.padStart(4, '0'));

    // 重新组装完整的 IPv6 地址
    return parts.join(':');
}

class IPv6 {
    constructor() {

    }

    isIPv6(val) {
        return ipv6Reg.test(val);
    }
    abbreviate(val) {
        if (ipv6Reg.test(val)) {
            simplifyIpv6(val)
        }
    }
    expand(val) {
        if (ipv6Reg.test(val)) {
            expandIpv6(val)
        }
    }
}

