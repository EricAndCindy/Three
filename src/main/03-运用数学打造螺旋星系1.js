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


// 生成一条螺旋臂（围绕x轴的点）
const params = {
    count: 100,
    size: 0.2,
    radius: 5,
    branch: 3,
    color: '#ffffff'
}
let geometry = null
let material = null
const generateGalaxy = () => {
    // （顶点构造器）生成顶点，每个顶点是由xyz三个坐标组成
    geometry = new THREE.BufferGeometry()
    // 随机生成位置 []
    const position = new Float32Array(params.count * 3) // 乘以3代表xyz，下面颜色同理rgb
    // 设置粒子顶点颜色
    const colors = new Float32Array(params.count * 3)
    // 设置顶点
    for (let i = 0; i < params.count; i++) {
        const current = i * 3 // 当前第几个点
        position[current] = Math.random() * params.radius // 每个点的x坐标随机生成
        position[current + 1] = 0 // 每个点的y坐标为0  
        position[current + 2] = 0 // 每个点的z坐标为0
        colors[i] = Math.random()
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(position, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    // 设置点材质
    material = new THREE.PointsMaterial({
        color: new THREE.Color(params.color),
        size: params.size, // 点大小
        sizeAttenuation: true, // 近的点大，远的点小
        depthWrite: false, // 叠加显示
        blending: THREE.AdditiveBlending,
        map: particlesTexture, // 使用来自Texture的数据设置点的颜色。可以选择包括一个alpha通道，通常与 .transparent或.alphaTest。
        alphaMap: particlesTexture, // alpha贴图是一张灰度纹理，用于控制整个表面的不透明度。（黑色：完全透明；白色：完全不透明）。 默认值为null。
        transparent: true, // 是否开启透明，需配合上面一个使用

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

