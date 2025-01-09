<script setup lang="ts">
import {nextTick, onMounted, Ref, ref} from 'vue'
import {createImgElement, fileToBase64, fileToDataUrl} from '../../utils/tools.ts'
import {ElMessage} from 'element-plus'
// import testImg from '../../assets/test.jpg'


let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let width: Ref<number> = ref(0);
let height: Ref<number> = ref(0);


const rotateMarks = {
  '-180': '-180°',
  0: '0°',
  180: '180°'
}


let lastTimeStamp = 0
const markClick = (e: any) => {

  if (e.timeStamp - lastTimeStamp < 200) {
    config.value.rotate = 0
    onChangeConfig()
  }
  lastTimeStamp = e.timeStamp

}

const config: any = ref({
  text: '仅用于XXX办理使用',
  type: 1,
  rotate: 0,
  fullScreen: 1,
  compress: false,
  compressScale: 1,
  color: 'rgba(255,255,255,0.3)',
  offsetY: 0,
  offsetX: 0,
  rowSpace: 20,
  columnSpace: 80,
  fontSize: 10,
  watermarkPicScale: 1,
  watermarkPicAlpha: 1,
  watermarkPic: '',
  textAlign: 'left',
  lineHeight: 1.5,
})

let rate: number;


/*
const test = async () => {


  await createImgElement(testImg).then((res: any) => {
    imgElement = res;
  });
  console.log(imgElement.width);

  if (imgElement.width > imgElement.height) {
    rate = imgElement.height / imgElement.width
    width.value = 1200;
    height.value = width.value * rate
  }
  if (imgElement.width < imgElement.height) {
    rate = imgElement.width / imgElement.height
    height.value = 1200;
    width.value = height.value * rate
  }

  canvas.width = imgElement.width;
  canvas.height = imgElement.height;

  drawBg()


}
*/

const containerWidth: Ref<number> = ref(0)
const actionWidth: Ref<number> = ref(0)
const workerWidth: Ref<number> = ref(0)

const initCanvasSize = () => {
  canvas = document.querySelector('canvas') as HTMLCanvasElement

  if (canvas) {

    containerWidth.value = document.querySelector('.container')?.clientWidth as number
    actionWidth.value = document.querySelector('.action')?.clientWidth as number
    workerWidth.value = 0

    if (containerWidth.value < 1200) {
      workerWidth.value = containerWidth.value
    } else {
      workerWidth.value = containerWidth.value - actionWidth.value
    }


    if (imgElement.value && imgElement.value.width <= imgElement.value.height) {

      width.value = 600 - 60
      height.value = width.value * (imgElement.value.height / imgElement.value.width)
    } else if (imgElement.value && imgElement.value.width >= imgElement.value.height) {
      width.value = 800 - 60
      height.value = width.value * (imgElement.value.height / imgElement.value.width)
    } else {
      width.value = workerWidth.value - 60
      height.value = width.value * (9 / 16)
    }


    ctx = canvas.getContext('2d') as CanvasRenderingContext2D


    // test()
  }
}

window.addEventListener('resize', () => {
  initCanvasSize()
})


onMounted(() => {

  nextTick(() => {

    initCanvasSize()

  })

})

let imgBase64: any, imgElement: any = ref(undefined)

const selectFiles: any = ref([])
const imgUrls: any = ref([])

const onSelectFile = async ({file}: any) => {


  const isSelect = selectFiles.value.findIndex((item: any) => item.name === file.name)

  if (isSelect === -1) {

    const imgUrl = await fileToDataUrl(file) as string

    selectFiles.value.push(file)
    imgUrls.value.push({url: imgUrl, config: {}})

    imgBase64 = await fileToBase64(file)
    imgElement.value = await createImgElement(imgBase64)
    selectIndex.value = selectFiles.value.length - 1
    initCanvas()
  } else {

    await onSelectPic(isSelect)

  }


}

const compressWidth = ref(0)
const compressHeight = ref(0)

const size = ref(0)

const initCanvas = () => {

  // console.log()


  if (imgElement.value.width > imgElement.value.height) {
    rate = imgElement.value.height / imgElement.value.width
    width.value = 800;
    height.value = width.value * rate
  }
  if (imgElement.value.width <= imgElement.value.height) {
    rate = imgElement.value.width / imgElement.value.height
    height.value = 800;
    width.value = height.value * rate
  }

  compressWidth.value = imgElement.value.width
  compressHeight.value = imgElement.value.height


  // if (imgElement.value.width>800 && imgElement.value.width>imgElement.value.height) {
  //
  //   const rate = imgElement.value.height/imgElement.value.width
  //   compressWidth.value = 800;
  //   compressHeight.value = compressWidth.value * rate
  //
  //   canvas.width = compressWidth.value
  //   canvas.height = compressHeight.value
  //
  // }

  canvas.width = compressWidth.value
  canvas.height = compressHeight.value

  console.log('压缩：', compressWidth.value, compressHeight.value)

  drawBg(ctx)


  // size.value = Math.ceil(selectFiles.value[selectIndex.value].size / 1024 / 1024 *100)/100


}

const generateTextInfo = (ctx: CanvasRenderingContext2D) => {

  ctx.font = `${config.value.fontSize * (compressWidth.value / 375)}px ali`;
  ctx.fillStyle = config.value.color;


  const textSplit = config.value.text.trim('\n').split('\n')

  let lineHeight = 0
  let textWidth = 0
  let lineAllWidth = []

  for (let lineIndex in textSplit) {
    const textMetrics = ctx.measureText(textSplit[lineIndex])
    lineHeight = textMetrics['actualBoundingBoxAscent']
    textWidth = Math.max(textWidth, textMetrics.width)
    lineAllWidth.push(textMetrics.width)

  }

  const textHeight = lineHeight * config.value.lineHeight * textSplit.length


  return {textSplit, lineHeight, textWidth, lineAllWidth, textHeight}


}

const drawTextWatermark = (ctx: CanvasRenderingContext2D, textSplit: any, x: number, y: number, textInfo: any) => {


  const { textWidth, lineAllWidth, lineHeight} = textInfo

  ctx.save()


  // ctx.beginPath();
  // ctx.arc(x, y, 5, 0, Math.PI * 2);
  // ctx.fill();
  // ctx.closePath();

  ctx.translate(x, y);


  ctx.rotate((Math.PI / 180) * config.value.rotate);

  // ctx.strokeRect(x, y, textWidth, textHeight);

  for (let lineIndex = 0; lineIndex < textSplit.length; lineIndex++) {

    // console.log('lineHeight', lineHeight)
    const _lineHeight = lineIndex * lineHeight * config.value.lineHeight

    let offset = 0
    if (config.value.textAlign === 'center') {
      offset = textWidth / 2 - lineAllWidth[lineIndex] / 2
    } else if (config.value.textAlign === 'right') {
      offset = textWidth - lineAllWidth[lineIndex]
    }

    // console.log((textHeight / 2 + _lineHeight) - textHeight / 2,_lineHeight)

    ctx.fillText(`${textSplit[lineIndex]}`, 0 - textWidth / 2 + offset, _lineHeight)


  }

  ctx.restore()


}


const drawWatermarkType2 = (ctx: CanvasRenderingContext2D) => {

  const textInfo = generateTextInfo(ctx)

  const {textSplit, textWidth, textHeight} = textInfo
  const _columnSpace = config.value.columnSpace * (compressHeight.value / 375)
  const _rowSpace = config.value.rowSpace * (compressWidth.value / 375)

  let column = Math.ceil(compressWidth.value / (textWidth + _columnSpace))
  let row = Math.ceil(compressHeight.value / (textHeight + _rowSpace))

  row = row + 2
  column = column + 2

  for (let c = 1; c <= column; c++) {


    for (let r = 1; r <= row; r++) {

      let textX = (c - 1) * (textWidth + _columnSpace)
      let textY = (r - 1) * (textHeight + _rowSpace)

      let translateX = textX
      let translateY = textY

      drawTextWatermark(ctx, textSplit, translateX - textWidth / 2 - _columnSpace, translateY - textHeight / 2, textInfo)

    }
  }
}
const drawWatermarkType3 = (ctx: CanvasRenderingContext2D) => {


  const _columnSpace = config.value.columnSpace * (compressHeight.value / 375)
  const _rowSpace = config.value.rowSpace * (compressWidth.value / 375)

  // console.log(_columnSpace, _rowSpace)

  let watermarkPicWidth = watermarkPicElement.width * config.value.watermarkPicScale

  let watermarkPicHeight = watermarkPicElement.height * config.value.watermarkPicScale


  let column = Math.ceil(compressWidth.value / (watermarkPicWidth + _columnSpace))
  let row = Math.ceil(compressHeight.value / (watermarkPicHeight + _rowSpace))


  row = row + 2
  column = column + 2

  // console.log(column, row)
  for (let c = 1; c <= column; c++) {


    for (let r = 1; r <= row; r++) {


      let imgX = (c - 1) * (watermarkPicWidth + _columnSpace)
      let imgY = (r - 1) * (watermarkPicHeight + _rowSpace)

      ctx.save()
      ctx.translate(imgX - watermarkPicWidth / 2 - _columnSpace, imgY - watermarkPicHeight / 2);
      ctx.rotate((Math.PI / 180) * config.value.rotate);
      ctx.globalAlpha = config.value.watermarkPicAlpha;
      ctx.drawImage(watermarkPicElement, 0 - watermarkPicWidth / 2, 0 - watermarkPicHeight / 2, watermarkPicWidth, watermarkPicHeight);
      // ctx.translate(-imgX, -imgY);

      ctx.restore()

    }
  }
}


const drawWatermarkType4 = (ctx: CanvasRenderingContext2D) => {


  const textInfo = generateTextInfo(ctx)

  const {textSplit} = textInfo
  let _offsetX = compressWidth.value / 100 * config.value.offsetX
  let _offsetY = compressHeight.value / 100 * config.value.offsetY

  drawTextWatermark(ctx, textSplit, _offsetX + compressWidth.value / 2, _offsetY + compressHeight.value / 2, textInfo)


}
const drawWatermarkType5 = (ctx: CanvasRenderingContext2D) => {


  let watermarkPicWidth = watermarkPicElement.width * (config.value.watermarkPicScale * (watermarkPicElement.width / watermarkPicElement.height))

  let watermarkPicHeight = watermarkPicElement.height * (config.value.watermarkPicScale * (watermarkPicElement.width / watermarkPicElement.height))

  // console.log(watermarkPicWidth)
  // console.log(watermarkPicHeight)

  ctx.save()


  let _offsetX = compressWidth.value / 100 * config.value.offsetX
  let _offsetY = compressHeight.value / 100 * config.value.offsetY


  ctx.translate(_offsetX + compressWidth.value / 2, _offsetY + compressHeight.value / 2);
  ctx.rotate((Math.PI / 180) * config.value.rotate);
  ctx.globalAlpha = config.value.watermarkPicAlpha;
  ctx.drawImage(watermarkPicElement, -watermarkPicWidth / 2, -watermarkPicHeight / 2, watermarkPicWidth, watermarkPicHeight);

  ctx.restore()


}


const drawBg = (_ctx: CanvasRenderingContext2D | null) => {

  if (!imgElement.value) {
    return;
  }

  if (!_ctx) {
    _ctx = ctx
  }


  if (config.value.compress) {

    compressWidth.value = imgElement.value.width * config.value.compressScale
    compressHeight.value = imgElement.value.height * config.value.compressScale


    canvas.width = compressWidth.value
    canvas.height = compressHeight.value


  }

  _ctx.restore()
  _ctx.clearRect(0, 0, compressWidth.value, compressHeight.value);
  _ctx.drawImage(imgElement.value, 0, 0, compressWidth.value, compressHeight.value);
  _ctx.save();

  if (config.value.fullScreen === 2) {

    if (config.value.type === 1) {
      drawWatermarkType4(_ctx)
    }

    if (config.value.type === 2) {
      drawWatermarkType5(_ctx)
    }


  }


  if (config.value.fullScreen === 1) {

    // drawWatermarkType1()
    if (config.value.type === 1) {
      drawWatermarkType2(_ctx)
    }

    if (config.value.type === 2) {
      drawWatermarkType3(_ctx)
    }

  }


  if (config.value.compress && !exportAllStatus.value) {
    canvas.toBlob((blob: any) => {

      size.value = Math.ceil(blob.size / 1024 / 1024 * 10) / 10

    }, (imgBase64 as string).split(';')[0].replace('data:', ''))

  }


}


let watermarkPicElement: HTMLImageElement;

const handleUploadWatermarkPic = async ({file}: any) => {


  await fileToBase64(file).then((res) => {
    config.value.watermarkPic = res;
    saveConfig()
  });

  await initWatermark()

  drawBg(ctx)

}

const initWatermark = async () => {

  if (!config.value.watermarkPic) {
    return;
  }

  await createImgElement(config.value.watermarkPic).then((res: any) => {
    watermarkPicElement = res as HTMLImageElement;
  });


}


const onSelectType = (type: any) => {
  saveConfig()

  if (type === 1) drawBg(ctx)

  if (type === 2 && config.value.watermarkPic) drawBg(ctx)

}

const onColorChange = (color: any) => {


  config.value.color = color

  onChangeConfig()

}

const onChangeConfig = () => {

  saveConfig()
  drawBg(ctx)

}


const selectIndex = ref(0)

const onSelectPic = async (imgIndex: number) => {


  const file = selectFiles.value[imgIndex]
  selectIndex.value = imgIndex
  imgBase64 = await fileToBase64(file)
  imgElement.value = await createImgElement(imgBase64)

  initCanvas()


}

const handleDeleteImg = (imgIndex: number) => {

  console.log(imgIndex, selectFiles.value.length)
  if (selectFiles.value.length === 1) {
    selectIndex.value = 0
    imgElement.value = null
    imgBase64 = null
    selectFiles.value.splice(imgIndex, 1)
    imgUrls.value.splice(imgIndex, 1)
    return;
  }

  if (selectIndex.value === imgIndex) {
    imgElement.value = null
    imgBase64 = null
    selectFiles.value.splice(imgIndex, 1)
    imgUrls.value.splice(imgIndex, 1)
    selectIndex.value = 0

    onSelectPic(imgIndex === 0 ? 0 : imgIndex - 1)
    return
  }

  selectFiles.value.splice(imgIndex, 1)
  imgUrls.value.splice(imgIndex, 1)


}


const exportImg = () => {

  // console.log(imgBase64)

  let type = (imgBase64 as string).split(';')[0].replace('data:', '')

  const dataUrl = canvas.toDataURL(type)
  const file: any = selectFiles.value[selectIndex.value]

  const fileName = file.name as string


  const fileNameArr = fileName.split('.')

  const ext = fileNameArr[fileNameArr.length - 1]

  const newFileName = `${fileNameArr.slice(0, fileNameArr.length - 1).join('.')}_${new Date().getTime()}.${ext}`


  var link = document.createElement('a');
  link.download = newFileName;
  link.href = dataUrl;
  link.click()

}
const copyImg = async () => {

  // console.log(imgBase64)

  // let type:any = (imgBase64 as string).split(';')[0].replace('data:', '')
  try {
    canvas.toBlob(async (blob: any) => {
      await navigator.clipboard.write([new ClipboardItem({
        ['image/png']: blob
      })]).then(() => {
        ElMessage.success('复制成功')
      }, () => {
      });
    }, 'image/png');
  } catch (err: any) {
    ElMessage.error('当前浏览器暂不支持复制到剪贴板')
  }

}

const exportAllStatus = ref(false)
const exportAllImg = async () => {

  exportAllStatus.value = true

  for (let imgIndex = 0; imgIndex < selectFiles.value.length; imgIndex++) {

    const file = selectFiles.value[imgIndex]
    selectIndex.value = imgIndex
    imgBase64 = await fileToBase64(file)
    imgElement.value = await createImgElement(imgBase64)
    initCanvas()

    exportImg()


  }

  exportAllStatus.value = false

}


const saveConfig = () => {
  localStorage.setItem('config', JSON.stringify(config.value))
}

let initConfig: any

const isLoad = ref(false)

const loadConfig = () => {

  initConfig = JSON.parse(JSON.stringify(config.value))
  const configStr = localStorage.getItem('config')

  if (configStr) {
    config.value = JSON.parse(configStr)

    if (config.value.fullScreen === true) {
      config.value.fullScreen = 1
    }
    if (config.value.fullScreen === false) {
      config.value.fullScreen = 2
    }

    if (config.value.compressScale === undefined) {
      config.value.compressScale = 1
    }

    if (config.value.watermarkPicAlpha === undefined) {
      config.value.watermarkPicAlpha = 1
    }


  }
  isLoad.value = true
  initWatermark()

}

const resetConfig = () => {
  config.value = JSON.parse(JSON.stringify(initConfig))
  if (imgElement.value) {
    drawBg(ctx)
  }
  saveConfig()
}


onMounted(() => {


  loadConfig()


})

</script>

<template>
  <div class="container">

    <div class="worker-content">


      <div class="preview-img-list" v-if="imgUrls.length">


        <div v-for="(img,imgIndex) in imgUrls" @click="onSelectPic(imgIndex)" :key="imgIndex" class="item">
          <el-icon @click.stop="handleDeleteImg(imgIndex)" class="delete" size="20">
            <IconClose/>
          </el-icon>
          <img class="img" :src="img.url">
        </div>
        <div style="color: #666" v-if="imgUrls.length">共{{ imgUrls.length }}张</div>

      </div>

      <div class="worker-pic">

        <div class="tip" v-if="!imgElement"
             :style="{width:width+'px',height:height+'px'}">

          <el-upload
              :style="{width:width+'px',height:height+'px','--el-upload-dragger-padding-horizontal':0,'--el-upload-dragger-padding-vertical':0}"
              drag
              multiple
              accept="image/*"
              :show-file-list="false"
              :http-request="onSelectFile"
          >
            <div
                :style="{height:`calc(${height}px - var(--el-upload-dragger-padding-horizontal) - var(--el-upload-dragger-padding-horizontal))`}"
                style="display: flex;justify-content: center;align-items: center">
              <el-icon size="28">
                <IconUploadFilled/>
              </el-icon>
              <div class="el-upload__text">
                图片处理区域,可批量拖入图片
              </div>
            </div>


          </el-upload>


        </div>

        <canvas class="canvas"
                :style="{width: `${(config.compress&&imgElement?width* config.compressScale:width)}px`,height: `${config.compress&&imgElement?height* config.compressScale:height}px`}">

        </canvas>

      </div>


    </div>


    <div class="action" v-if="isLoad">



      <el-upload
          drag
          multiple
          :show-file-list="false"
          accept="image/*"

          :http-request="onSelectFile"
      >
        <div>
          <el-icon size="28">
            <IconUploadFilled/>
          </el-icon>
          <div class="el-upload__text">
            点击或拖入你的图片
          </div>
        </div>


      </el-upload>

      <div class="item">

        <div class="title">水印模式</div>

        <div class="value">
          <el-radio-group @change="onChangeConfig" v-model="config.fullScreen">
            <el-radio-button :value="0">关闭</el-radio-button>
            <el-radio-button :value="1">全屏水印</el-radio-button>
            <el-radio-button :value="2">单个水印</el-radio-button>

          </el-radio-group>
        </div>


      </div>

      <div class="item" v-if="config.fullScreen!==0">

        <div class="title">水印图案</div>

        <div class="value">
          <el-radio-group @change="onSelectType" v-model="config.type">

            <el-radio :value="1">文字</el-radio>
            <el-radio :value="2">图案</el-radio>

          </el-radio-group>
        </div>


      </div>

      <div class="item" v-if="config.type===1&&config.fullScreen!==0">

        <div class="title">水印文字</div>

        <div class="value">
          <el-input type="textarea" @input="onChangeConfig" v-model="config.text"></el-input>
        </div>
      </div>
      <div class="item" v-if="config.type===1&&config.fullScreen!==0">

        <div class="title">水印颜色</div>

        <div class="value">
          <el-color-picker @active-change="onColorChange" v-model="config.color" show-alpha/>

        </div>
      </div>


      <div class="item" v-if="config.type===2&&config.fullScreen!==0">

        <div class="title">水印图片</div>

        <div class="value">
          <el-upload
              class="upload-demo"
              drag
              multiple
              accept="image/*"
              :show-file-list="false"
              :http-request="handleUploadWatermarkPic"
          >
            <div v-if="!config.watermarkPic">
              <el-icon size="28">
                <IconUploadFilled/>
              </el-icon>
              <div class="el-upload__text">
                点击或拖入图片
              </div>
            </div>

            <div v-else>

              <img style="width: 100%;height: 100%;object-fit: cover" :src="config.watermarkPic">

            </div>


          </el-upload>
        </div>


      </div>
      <div class="item" v-if="config.type===2&&config.fullScreen!==0">

        <div class="title">水印大小</div>

        <div class="value">
          <el-slider v-model="config.watermarkPicScale" @input="onChangeConfig" :min="0" :step="0.1" :max="10"/>
        </div>

      </div>
      <div class="item" v-if="config.type===2&&config.fullScreen!==0">

        <div class="title">水印透明度</div>

        <div class="value">
          <el-slider v-model="config.watermarkPicAlpha" @input="onChangeConfig" :min="0" :step="0.1" :max="1"/>
        </div>

      </div>
      <div class="item" v-if="config.type===1&&config.fullScreen!==0">

        <div class="title">字体大小</div>

        <div class="value">
          <el-slider v-model="config.fontSize" @input="onChangeConfig" :min="1" :max="100"/>
        </div>

      </div>
      <div class="item" v-if="config.type===1&&config.fullScreen!==0">

        <div class="title">行高</div>

        <div class="value">
          <el-slider v-model="config.lineHeight" @input="onChangeConfig" :min="1" :step="0.1" :max="5"/>
        </div>

      </div>
      <div class="item" v-if="config.type===1&&config.fullScreen!==0">

        <div class="title">对齐方式</div>

        <div class="value">
          <el-radio-group @change="onChangeConfig" v-model="config.textAlign">

            <el-radio value="left">左对齐</el-radio>
            <el-radio value="center">居中</el-radio>
            <el-radio value="right">右对齐</el-radio>

          </el-radio-group>
        </div>

      </div>

      <div class="item" v-if="config.fullScreen===1">

        <div class="title">行间距</div>

        <div class="value">
          <el-slider v-model="config.rowSpace" @input="onChangeConfig" :max="300"/>
        </div>

      </div>

      <div class="item" v-if="config.fullScreen===1">

        <div class="title">列间距</div>

        <div class="value">
          <el-slider v-model="config.columnSpace" @input="onChangeConfig" :max="300"/>
        </div>

      </div>

      <div class="item" v-if="config.fullScreen===2">

        <div class="title">X</div>

        <div class="value">
          <el-slider v-model="config.offsetX" @input="onChangeConfig" :min="-50" :max="50"/>
        </div>

      </div>
      <div class="item" v-if="config.fullScreen===2">

        <div class="title">Y</div>

        <div class="value">
          <el-slider v-model="config.offsetY" @input="onChangeConfig" :min="-50" :max="50"/>
        </div>

      </div>
      <div class="item" v-if="config.fullScreen!==0">

        <div class="title">旋转</div>

        <div class="value" @click="markClick">
          <el-slider :marks="rotateMarks" v-model="config.rotate" @input="onChangeConfig" :min="-180" :max="180"/>
        </div>

      </div>

      <div class="item">

        <div class="title">是否压缩</div>

        <div class="value">
          <el-switch :active-value="true" :inactive-value="false" v-model="config.compress"></el-switch>
        </div>


      </div>
      <div class="item" v-if="config.compress">

        <div class="title">缩放比例</div>

        <div class="value">
          <el-slider v-model="config.compressScale" @input="onChangeConfig" :min="0.1" :max="2" :step="0.1"/>
        </div>

        <div class="after">

          <div class="input" style="width: 50px">
            <input disabled class="input-content" v-model="compressWidth">
            <span class="unit">宽</span>
          </div>
          <div style="padding: 0 5px">x</div>
          <div class="input" style="width: 50px">
            <input disabled class="input-content" v-model="compressHeight">
            <span class="unit">高</span>
          </div>
          <span>≈{{ size }}m</span>
          <!--          <el-input style="width: 100px" size="small" v-model="compressWidth">-->
          <!--            <template #append>-->
          <!--              <span>宽</span>-->
          <!--            </template>-->
          <!--          </el-input>-->
          <!--          <span>x</span>-->
          <!--          <el-input style="width: 100px" size="small" v-model="compressHeight">-->
          <!--            <template #append>-->
          <!--              <span>高</span>-->
          <!--            </template>-->
          <!--          </el-input>-->

        </div>


      </div>

      <div class="item" style="justify-content: center;">

        <el-button :disabled="!imgElement" @click="exportImg" type="primary" style="width: 200px;">导出到文件夹
        </el-button>
        <el-button :disabled="!imgElement" @click="copyImg" type="primary" style="width: 200px;">复制到剪贴板
        </el-button>


      </div>

      <div class="item" style="justify-content: center;">

        <el-button :disabled="!imgElement" @click="exportAllImg" type="primary" style="width: 200px;">批量导出
        </el-button>

        <el-button @click="resetConfig" type="success" style="width: 200px;">重置配置
        </el-button>

      </div>

      <div class="item" style="flex-direction: column;align-items: flex-start">

        <div style="text-align: left;font-size: 12px;line-height: 1.6">
          本工具保证不上传图片到服务器，所有图片均保存在浏览器缓存中
        </div>
        <div style="text-align: left;font-size: 12px;line-height: 1.6">
          推荐在PC中的Chrome，新edge浏览器中使用，可使用完整功能
        </div>

        <div style="font-size: 12px;margin-top: 10px">
          <div>更新记录：</div>
          <div>1.4 新增支持多行文字，双击角度可归零</div>
          <div>1.3 适配暗黑模式、图片水印可调整透明度</div>
          <div>1.2 新增图片压缩</div>
          <div>1.1 新增批量导出、记住上一次的配置</div>
          <div>1.0 水印小工具发布</div>
        </div>

      </div>

    </div>


  </div>

</template>

<style scoped lang="scss">
@import "index";

@font-face {
  font-family: 'ali';
  src: url('/AlibabaPuHuiTi-3-65-Medium.woff2') format('woff2'), url('/AlibabaPuHuiTi-3-65-Medium.ttf') format('truetype');
}




</style>
