import * as THREE from 'three'
import { Mesh, TextureLoader } from 'three'
// 导入轨道控制器 (类)
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
// 导入动画库
import gsap from 'gsap'


// 创建场景
const scene = new THREE.Scene()
// 创建相机
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 300)
const textureLoader = new THREE.TextureLoader()
const particlesTexture = textureLoader.load(require('../assets/textures/particles/1.png'))
// 设置相机位置 x, y, z
camera.position.set(0, 0, 18)
scene.add(camera)


const cubeGeometry = new THREE.BoxGeometry(2, 2, 2)
const material = new THREE.MeshBasicMaterial({
    wireframe: true, // 设置为边框几何体，即渲染为平面多边形
})
const redMaterial = new THREE.MeshBasicMaterial({ color: '#ff0000' })

// 创建1000个立方体 （page1）
let cubeArr = []
// 它几乎和Object3D是相同的，其目的是使得组中对象在语法上的结构更加清晰。（当需要操控很多个物体组成的物体时可以使用到group）
let cubeGroup = new THREE.Group()
for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
        for (let z = 0; z < 5; z++) {
            const cube = new Mesh(cubeGeometry, material)
            cube.position.set(i * 2 - 5, j * 2 - 4, z * 2 - 4)
            scene.add(cube)
            cubeArr.push(cube)
            cubeGroup.add(cube) // 将每个物体对象添加到group
        }
    }
}
cubeGroup.position.set(0, -2, 0)
scene.add(cubeGroup)


// 创建三角形（page2）
// 创建三角组
const sjxGroup = new THREE.Group()
for (let i = 0; i < 50; i++) {
    // 每一个三角形，需要三个顶点，每个顶点需要三个值xyz
    const geometry = new THREE.BufferGeometry();
    const positionArray = new Float32Array(9)
    for (let j = 1; j <= 9; j++) {
        positionArray[j] = Math.random() * 10 - 5
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3))
    let color = new THREE.Color(Math.random(), Math.random(), Math.random())
    const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .5, side: THREE.DoubleSide });
    // 根据几何体和材质创建物体
    const mesh = new THREE.Mesh(geometry, material)
    sjxGroup.add(mesh)
    // 将创建的物体添加到场景
}
sjxGroup.position.set(0, -32, 0)
scene.add(sjxGroup)


// 弹跳小球 （page3）
// 创建小球组
const sphereGroup = new THREE.Group()
const sphereGeometry = new THREE.SphereGeometry(1, 40, 40) // SphereGeometry(半径，水平分段数（沿着经线分段），最小值为3，默认值为32, 分段数越大，水平棱角越少，下个参数为垂直方向同理)
const sphereMaterial = new THREE.MeshStandardMaterial()// 标准网格材质，需要光照哦，这里不是基础材质
const sphere = new THREE.Mesh(sphereGeometry, material) // 通过几何体和材质创建物体
// 投射阴影
sphere.castShadow = true
sphereGroup.add(sphere)
// 创建平面 
const planeGeometry = new THREE.PlaneGeometry(50, 50)
const plane = new THREE.Mesh(planeGeometry, sphereMaterial)
plane.position.set(0, -1, 0)
plane.rotation.x = -Math.PI / 2
// 接收阴影
plane.receiveShadow = true
sphereGroup.add(plane)
// 灯光 
// const light = new THREE.AmbientLight(0xffffff, 0.01); // 环境光（四面周围的光） 设置光的强度，默认为1 
// sphereGroup.add(light);
// 创建小球
const smallBall = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 20, 20),
    new THREE.MeshBasicMaterial({ color: 0xff0000 })
)
smallBall.position.set(2, 2, 2)
// 点光源
const pointLight = new THREE.PointLight(0xff0000, 1);
pointLight.position.set(2, 2, 2) // xyz
// 设置光照投射阴影
pointLight.castShadow = true
// 设置阴影贴图模糊度（阴影模糊度）
pointLight.shadow.radius = 20
// 设置阴影贴图的分辨率（默认的阴影是很模糊度，是那种杂乱无章的模糊），默认分辨率为512 * 512
pointLight.shadow.mapSize.set(4096, 4096) // 只能设置 512 的倍数
// 将光加到物体身上，小球也就变为了光源体
smallBall.add(pointLight)
sphereGroup.add(smallBall);
sphereGroup.position.set(0, -64, 0)
scene.add(sphereGroup)




/*  
    创建投射光线对象 （属于page1）
    这个类用于进行raycasting（光线投射）。 光线投射用于进行鼠标拾取（在三维空间中计算出鼠标移过了什么物体）。
*/
const raycaster = new THREE.Raycaster()

// 鼠标的xy的二维对象  {x: 1, y: 1}
const mouse = new THREE.Vector2()

// 监听鼠标的位置
window.addEventListener('mousemove', (e) => {
    mouse.x = e.pageX / window.innerWidth - 0.5
    mouse.y = e.pageY / window.innerHeight - 0.5
})

// 监听鼠标的点击
window.addEventListener('click', (event) => {
    // console.log(event);
    mouse.x = (event.pageX / window.innerWidth) * 2 - 1 // (event.pageX / window.innerWidth) 结果0~1，再乘以2 结果0~2，-1结果-1~1
    mouse.y = -((event.pageY / window.innerHeight) * 2 - 1) // 页面的y轴与坐标的y轴正负方向相反
    raycaster.setFromCamera(mouse, camera)

    let result = raycaster.intersectObjects(cubeArr)
    /* 
        result: []
        distance —— 射线投射原点和相交部分之间的距离。
        point —— 相交部分的点（世界坐标）
        faceIndex —— 相交的面的索引
        object —— 相交的物体
        ......
    */
    console.log(result);
    result.forEach(item => { item.object.material = redMaterial })
})



// 三页屏中的三个物体组
const allGroup = [cubeGroup, sjxGroup, sphereGroup]


// 当前页
let currentPage = 0
// 监听滚动事件
window.addEventListener('scroll', () => {
    // 页面被卷去的高度 除以 页面可视高度，根据四舍五入判断当前是滚动到了哪一页，以页面的中心横线为参照点
    const newPage = Math.round(window.scrollY / window.innerHeight)
    if (newPage !== currentPage) {
        currentPage = newPage
        console.log('改变页面，当前是：' + currentPage);
        gsap.to(allGroup[currentPage].rotation, {
            z: '+=' + Math.PI,
            duration: 1.5
        })
    }
})


// 初始化渲染器
const renderer = new THREE.WebGLRenderer({ alpha: true })
// 设置渲染的尺寸大小
renderer.setSize(window.innerWidth, window.innerHeight)
// 将webgl渲染的canvas内容添加到body上
document.body.appendChild(renderer.domElement)


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

gsap.to(smallBall.position, {
    x: '-=' + Math.PI,
    z: '+=' + Math.PI,
    duration: 1,
    ease: 'power2.inOut',
    repeat: -1,
    yoyo: true
})

const render = () => {
    let time = clock.getElapsedTime()
    let detla = clock.getDelta()
    // 立方体组
    cubeGroup.rotation.x = time * 0.5
    cubeGroup.rotation.y = time * 0.5

    // 三角组
    sjxGroup.rotation.x = time * 0.5
    sjxGroup.rotation.y = time * 0.5

    // 小球组
    smallBall.position.x = Math.sin(time) * 3 // 发光的小球
    smallBall.position.z = Math.cos(time) * 3
    smallBall.position.y = Math.sin(time * 10) / 2
    sphereGroup.rotation.x = Math.sin(time) * 0.05 // 组
    sphereGroup.rotation.z = Math.sin(time) * 0.05

    // 根据当前页面被卷去的高度，去设置相机移动的位置
    camera.position.y = -(window.scrollY / window.innerHeight) * 30 // 乘以30是因为每个物体y向量间隔30
    camera.position.x = mouse.x * 10


    // controls.update()
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

