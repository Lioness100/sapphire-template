export const pluralize = (title: string, count: number) => {
	return `${count} ${title}${count === 1 ? '' : 's'}`;
};

export const commaList = (arr: string[] | readonly string[]) => {
	return arr.length <= 1 ? arr[0] ?? '' : `${arr.slice(-1).join(', ')}${arr.length > 2 ? ',' : ''} and ${arr[arr.length - 1]}`;
};
