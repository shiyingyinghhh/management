export const fileSize = (bytes) => {
    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let size = bytes,
        unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }
    return `${Math.round(size * 100) / 100}${units[unitIndex]}`;
};

export const download = (url, filename) => {
    return fetch(url).then(res=>res.blob()).then(res => {
        const link = document.createElement('a')
        link.href = URL.createObjectURL(res)
        link.download = filename
        link.click()
        URL.revokeObjectURL(link.href)
    })
};
