const wait = (waitTimeMS) => {
    return new Promise(resolve => setTimeout(resolve, waitTimeMS))
}

export default wait;
