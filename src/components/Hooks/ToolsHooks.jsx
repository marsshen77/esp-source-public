import { useState, useEffect } from "react";
import 'whatwg-fetch';

const useFetch = url => {
    const [data, setData] = useState(null);

    const myFetch = async () => {
        try {
            const resp = await fetch(url);
            const json = await resp.json();
            if (json.State) setData(json.Data);
            else console.error(`Request Failed,code：${json.Code},Message:${json.Message}`);
        } catch (error) {
            console.error(error);
        }
    }
    useEffect(
        () => {
            myFetch();
        },
        [url]
    );
    return data;
};

const useLoadScriptFile = url => {
    const [loaded, setLoaded] = useState(false);
    const loadScriptFile = () => {
        const script = document.createElement("script")
        script.type = "text/javascript";
        if (script.readyState) { //IE
            script.onreadystatechange = () => {
                if (script.readyState == "loaded" || script.readyState == "complete") {
                    script.onreadystatechange = null;
                    esp.defaultRS.push(url);
                    setLoaded(true);
                }
            };
        } else { //Others
            script.onload = () => {
                esp.defaultRS.push(url);
                setLoaded(true);
            };
        }
        script.src = url;
        document.getElementsByTagName("head")[0].appendChild(script);
    }
    useEffect(() => {
        if (~esp.defaultRS.indexOf(url))
            setLoaded(true);
        else
            loadScriptFile()
    }, [url])
    if(!url) return true;
    return loaded;
}
export { useFetch, useLoadScriptFile };
