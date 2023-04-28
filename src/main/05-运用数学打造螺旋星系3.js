import * as THREE from 'three'
import { TextureLoader } from 'three'
// 导入轨道控制器 (类)
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'


// 创建场景
const scene = new THREE.Scene()
// 创建相机
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
const textureLoader = new THREE.TextureLoader()
const particlesTexture = textureLoader.load(require('../assets/textures/particles/1.png'))
// 设置相机位置 x, y, z
camera.position.set(0, 0, 10)
scene.add(camera)


// 生成三条弯曲螺旋臂
const params = {
    count: 5000,
    size: 0.2,
    radius: 5,
    branch: 6,
    color: '#ff6030',
    endColor: '#1b3984',
    rotate: 0.3
}
let geometry = null
let material = null

/* 
    Color( r : Color_Hex_or_String, g : Float, b : Float )
    r - (可选参数) 如果参数g和b被定义，则r表示颜色中的红色分量。 如果未被定义，r可以是一个十六进制 hexadecimal triplet 颜色值或CSS样式的字符串或一个Color实例。
    g - (可选参数) 如果被定义，表示颜色中的绿色分量。
    b - (可选参数) 如果被定义，表示颜色中的蓝色分量。
*/
const centerColor = new THREE.Color(params.color)
const endColor = new THREE.Color(params.endColor)
const generateGalaxy = () => {
    // （顶点构造器）生成顶点，每个顶点是由xyz三个坐标组成
    geometry = new THREE.BufferGeometry()
    // 随机生成位置 []
    const position = new Float32Array(params.count * 3) // 乘以3代表xyz，下面颜色同理rgb
    // 设置粒子顶点颜色
    const colors = new Float32Array(params.count * 3)
    // 设置顶点
    for (let i = 0; i < params.count; i++) {

        /* 
            在三角函数中，当cos0的时候，意味着邻边和斜边相等（这是一种极限状态），所以除出来自然就等于1。根据定义cos角度＝X／R。在单位圆中，所以当角度等于0时，也就是图形为一条直线。那么，X＝R＝1，所以cos0＝1。
        */
        // 当前的点应该在哪一条分支的角度上 (i % params.branch)：0 1 2 三者之一; ((2 * Math.PI) / params.branch): 120度
        const branchAngel = (i % params.branch) * ((2 * Math.PI) / params.branch) // 如果是0分支角度为0, 1分支角度为120, 2分支角度为240
        // 当前点距离圆心的距离
        const distance = Math.random() * params.radius

        const current = i * 3 // 当前第几个点

        const randomx = Math.pow(Math.random() * 2 - 1, 3)
        const randomy = Math.pow(Math.random() * 2 - 1, 3)
        const randomz = Math.pow(Math.random() * 2 - 1, 3)

        position[current] = Math.cos(branchAngel + distance * params.rotate) * distance + randomx // 每个点的x坐标
        position[current + 1] = 0 + randomy // 每个点的y坐标为0  
        position[current + 2] = Math.sin(branchAngel + distance * params.rotate) * distance + randomz // 每个点的z坐标为0

        // 混合颜色，形成渐变色
        const mixColor = centerColor.clone() // 赋值一份color
        mixColor.lerp(endColor, distance / params.radius) // color - 用于收敛的颜色。 alpha - 介于0到1的数字。(渐变)
        colors[current] = mixColor.r
        colors[current + 1] = mixColor.g
        colors[current + 2] = mixColor.b
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(position, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    // 设置点材质
    material = new THREE.PointsMaterial({
        // color: new THREE.Color(params.color),
        size: params.size, // 点大小
        sizeAttenuation: true, // 近的点大，远的点小
        depthWrite: false, // 叠加显示
        blending: THREE.AdditiveBlending,
        map: particlesTexture, // 使用来自Texture的数据设置点的颜色。可以选择包括一个alpha通道，通常与 .transparent或.alphaTest。
        alphaMap: particlesTexture, // alpha贴图是一张灰度纹理，用于控制整个表面的不透明度。（黑色：完全透明；白色：完全不透明）。 默认值为null。
        transparent: true, // 是否开启透明，需配合上面一个使用
        vertexColors: true
    })
    // 将几何体和点材质创建为由点组成的物体
    const points = new THREE.Points(geometry, material)
    scene.add(points)
    return points

}
generateGalaxy()



// 初始化渲染器
const renderer = new THREE.WebGLRenderer()
// 设置渲染的尺寸大小
renderer.setSize(window.innerWidth, window.innerHeight)
// 将webgl渲染的canvas内容添加到body上
document.body.appendChild(renderer.domElement)

// 创建轨道控制器
const controls = new OrbitControls(camera, renderer.domElement)
// 开启控制器阻尼，更有真实效果，有惯性（设置的同时还需要在render请求动画函数中设置update更新方法才会生效）
controls.enableDamping = true

// 设置坐标轴辅助器 AxesHelper( size : Number ) 代表轴的线段长度，默认为1
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// 设置时钟
const clock = new THREE.Clock()
window.addEventListener('dblclick', () => {
    // 判断是否全屏，全返回全屏的元素，不全返回null
    const fullScreenElement = document.fullscreenElement
    // 双加控制屏幕全屏和退出全屏
    if (fullScreenElement == null) {
        renderer.domElement.requestFullscreen() // 找到画布设置全屏
    } else {
        document.exitFullscreen() // 退出全屏
    }
})

const render = () => {
    let time = clock.getElapsedTime()
    controls.update()
    renderer.render(scene, camera)
    requestAnimationFrame(render) // 请求动画会给render传递一个时间，为当前请求动画帧执行的毫秒数
}
render()

// 监听页面尺寸变化，更新渲染页面
window.addEventListener('resize', () => {
    // 更新摄像头的位置
    camera.aspect = window.innerWidth / window.innerHeight
    // 更新摄像机的投影矩阵
    camera.updateProjectionMatrix()
    // 更新渲染器
    renderer.setSize(window.innerWidth, window.innerHeight)
    // 设置渲染器的像素比
    renderer.setPixelRatio(window.devicePixelRatio)
})

