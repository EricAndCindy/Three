import * as THREE from 'three'
// 导入轨道控制器 (类)
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'


// 创建场景
const scene = new THREE.Scene()
// 创建相机
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10001)
// 设置相机位置 x, y, z
camera.position.set(0, 0, 10)
scene.add(camera)



// 面片、线或点几何体的有效表述
const particlesGeometry = new THREE.BufferGeometry()
const count = 5000
// 设置缓冲区的数组 []
const position = new Float32Array(count * 3) // 让position变为一个长度为15000的数组，填充数组占位信息
// 设置粒子顶点颜色
const colors = new Float32Array(count * 3) // 乘以3代表rgb，上面位置同理xyz
// 设置顶点
for (let i = 0; i < count * 3; i++) {
    position[i] = (Math.random() - 0.5) * 100;
    colors[i] = Math.random()
}
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(position, 3))
particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

// 设置点的材质 用于定义材质外观的对象，具有一个或多个属性。 材质的任何属性都可以从此处传入(包括从Material继承的任何属性)。
const pointMaterial = new THREE.PointsMaterial()
// 设置点材质的大小, 默认为1,（每个点的是一个立方体），
pointMaterial.size = 0.5
// 材质的颜色
pointMaterial.color.set(0xfff000)
// 指定点的大小是否因相机距离深度而衰减。（每个点看上去都一样大）默认为true
pointMaterial.sizeAttenuation = true

// 载入纹理
const textureLoader = new THREE.TextureLoader()
const texture = textureLoader.load(require('../assets/textures/particles/xh.png'))
// 设置点材质纹理
pointMaterial.map = texture
pointMaterial.alphaMap = texture
pointMaterial.transparent = true
pointMaterial.depthWrite = false

// 是否使用顶点着色
pointMaterial.vertexColors = true

// 将几何体和点材质创建为由点组成的物体
const points = new THREE.Points(particlesGeometry, pointMaterial)
scene.add(points)







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

