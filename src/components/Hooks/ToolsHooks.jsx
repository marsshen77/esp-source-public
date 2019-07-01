import { useState, useEffect } from "react";

const useFetch = (url) => {
    const [data, updateData] = useState(null);

    async function myFetch() {
        const resp = await fetch(url);
        const json = await resp.json();
        if (json.State) updateData(json.Data);
        else console.error(`Request Failed,code：${json.Code},Message:${json.Message}`);
    }
    useEffect(
        () => {
            myFetch();
        },
        [url]
    );

    return data;
};

export { useFetch };
