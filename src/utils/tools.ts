export const fileToBase64 = (file: any) => {


    return new Promise((resolve, reject) => {

        const reader = new FileReader();
        reader.onload = (e: any) => {
            resolve(e.target.result)
        }
        reader.onerror = (err: any) => {
            reject(err)
        }
        reader.readAsDataURL(file);


    })


};


export const fileToDataUrl = (file: any) => {


    return new Promise((resolve) => {

        const url:string = URL.createObjectURL(file)

        resolve(url)

    })


};

export const dataUrlToBlob = (dataurl: string) => {

    let arr = dataurl.split(','),
        mime: string = (arr[0].match(/:(.*?);/) as any)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }

    return new Blob([u8arr], {type: mime});

    // encodeURIComponent


}


export const blobToFile = (blob: any, fileName: any) => {


    let file = new File([blob], fileName, {type: blob.type})

    return file;


}

export const createImgElement = (src: string) => {

    return new Promise((resolve, reject) => {

        const img = new Image();

        img.onload = () => {
            resolve(img);
        };
        img.onerror = (err) => {
            reject(err);
        }

        img.src = src;

    })


}


export const compressImg = async (file: any, scaleSize = 600) => {


    let imgSrc: any = '';

    await fileToBase64(file).then(res => {
        imgSrc = res;
    })

    let canvas = document.createElement('canvas');


    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;


    let img: any;

    await createImgElement(imgSrc).then((res) => {

        img = res;

    });

    ctx.scale(1, 1)

    // console.log();


    let scaleWidth: number = 0;
    let scaleHeight: number = 0;

    if (img.width > img.height && img.width > scaleSize) {

        let ratio: number = scaleSize / img.width;
        scaleWidth = scaleSize * 2;
        scaleHeight = ratio * img.height * 2;

    }

    if (img.height > img.width && img.height > scaleSize) {

        let ratio: number = scaleSize / img.height;
        scaleHeight = scaleSize * 2;
        scaleWidth = ratio * img.width * 2;

    }

    canvas.width = scaleWidth;
    canvas.height = scaleHeight;
    ctx.drawImage(img, 0, 0, scaleWidth, scaleHeight);

    let newFile = blobToFile(dataUrlToBlob(canvas.toDataURL(file.type)), file.name);

    console.log(newFile);

    return newFile;


}

