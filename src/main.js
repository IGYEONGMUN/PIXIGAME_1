import "./style.css";
import {
    Assets,
    Application,
    AnimatedSprite,
    Texture,
    Rectangle,
    TilingSprite,
} from "pixi.js";

export default async function main() {

    // PixiJS 애플리케이션 초기화
    const app = new Application();
    await app.init({
        background: "#1099bb",
        resizeTo: window,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
    });


    // 캔버스 설정
    app.canvas.id = "game-canvas";
    document.body.appendChild(app.canvas);

    try {
        // 에셋 로드
        const walkSheet = await Assets.load("./assets/Slime1_Walk_body.png");
        const jumpSheet = await Assets.load("./assets/Slime1_Jump_body.png");

        // 걷기 애니메이션 프레임 생성 (1행 사용)
        const walkFrames = [];
        const frameWidth = 64;
        const frameHeight = 64;
        const framesInRow = 8;
        const targetRow = 0; // 1행 (0부터 시작)

        for (let i = 0; i < framesInRow; i++) {
            const frame = new Texture({
                source: walkSheet,
                frame: new Rectangle(i * frameWidth, targetRow * frameHeight, frameWidth, frameHeight),
            });
            walkFrames.push(frame);
        }

        // 점프 애니메이션 프레임 생성 (오른쪽 점프: 3행, 왼쪽 점프: 2행)
        const jumpRightFrames = [];
        const jumpLeftFrames = [];
        const totalJumpFrames = 8;
        const targetRowJumpRight = 3; // 오른쪽 점프 (4행)
        const targetRowJumpLeft = 2;  // 왼쪽 점프 (3행)

        for (let i = 0; i < totalJumpFrames; i++) {
            // 오른쪽 점프 프레임
            const frameRight = new Texture({
                source: jumpSheet,
                frame: new Rectangle(i * frameWidth, targetRowJumpRight * frameHeight, frameWidth, frameHeight),
            });
            jumpRightFrames.push(frameRight);

            // 왼쪽 점프 프레임
            const frameLeft = new Texture({
                source: jumpSheet,
                frame: new Rectangle(i * frameWidth, targetRowJumpLeft * frameHeight, frameWidth, frameHeight),
            });
            jumpLeftFrames.push(frameLeft);
        }

        // 플레이어 생성
        const player = new AnimatedSprite(walkFrames);
        player.animationSpeed = 0.2;
        player.scale.set(3);
        player.x = 100;
        player.y = 300;
        // 실제 캐릭터 히트박스 조정
        const hitboxOffset = 23; // 스프라이트 상단의 빈 공간 크기
        app.stage.addChild(player);
        player.play();

        // 플랫폼 배열 생성
        const platforms = [];
        
        // 플랫폼 정의 (x, y, width, height)
        const platformConfigs = [
            { x: 0, y: 800, width: 400, height: 20 }, // 기본 플랫폼
            { x: 750, y: 350, width: 200, height: 20 }, // 오른쪽 위 플랫폼
            { x: 200, y: 500, width: 200, height: 20 }, // 왼쪽 위 플랫폼
            { x: 500, y: 200, width: 150, height: 20 }, // 최상단 플랫폼
        ];

        // 랜덤 플랫폼 추가
        const randomPlatformCount = 10;
        for (let i = 0; i < randomPlatformCount; i++) {
            const width = Math.floor(Math.random() * 150) + 80; // 80~230
            const height = 20;
            const x = Math.floor(Math.random() * (app.screen.width - width));
            const y = Math.floor(Math.random() * (app.screen.height - 100));
            platformConfigs.push({ x, y, width, height });
        }

        // 플랫폼 생성 및 추가
        platformConfigs.forEach(config => {
            const platform = new TilingSprite({
                texture: Texture.WHITE,
                width: config.width,
                height: config.height,
            });
            platform.tint = 0x00FF00;
            platform.x = config.x;
            platform.y = config.y;
            app.stage.addChild(platform);
            platforms.push(platform);
        });

        // 게임 상태 변수
        let velocityY = 0;
        const gravity = 0.5;
        const jumpForce = -15;
        let isJumping = false;
        let isMoving = false;
        let currentAnimation = 'walk';
        let lastDirection = 'right'; // 마지막 이동 방향 저장

        // 애니메이션 전환 함수
        function changeAnimation(animation, direction) {
            if (currentAnimation === animation && direction === lastDirection) return;
            
            currentAnimation = animation;
            lastDirection = direction;
            let frames;
            
            if (animation === 'walk') {
                frames = walkFrames;
            } else if (animation === 'jump') {
                frames = direction === 'right' ? jumpRightFrames : jumpLeftFrames;
            }
            
            player.textures = frames;
            player.play();
        }

        // 첫 번째 프레임으로 돌아가는 함수
        function resetToFirstFrame() {
            player.gotoAndStop(0);
        }

        // 키보드 입력 처리
        const keys = {};
        window.addEventListener("keydown", (e) => {
            keys[e.key] = true;
            if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
                isMoving = true;
                const newDirection = e.key === "ArrowRight" ? 'right' : 'left';
                if (isJumping) {
                    changeAnimation('jump', newDirection);
                } else {
                    changeAnimation('walk', newDirection);
                }
            }
            if (e.key === " " && !isJumping) {  // 스페이스바로 변경
                isJumping = true;
                changeAnimation('jump', lastDirection);
                velocityY = jumpForce;
            }
        });

        window.addEventListener("keyup", (e) => {
            keys[e.key] = false;
            if (!keys["ArrowLeft"] && !keys["ArrowRight"]) {
                isMoving = false;
                if (!isJumping) {
                    resetToFirstFrame();
                }
            }
        });

        // 게임 루프
        app.ticker.add(() => {
            // 좌우 이동
            if (keys["ArrowLeft"]) {
                player.x -= 5;
                if (!isJumping) {
                    changeAnimation('walk', 'left');
                } else {
                    changeAnimation('jump', 'left');
                }
            }
            if (keys["ArrowRight"]) {
                player.x += 5;
                if (!isJumping) {
                    changeAnimation('walk', 'right');
                } else {
                    changeAnimation('jump', 'right');
                }
            }

            // 중력 적용
            velocityY += gravity;
            const nextY = player.y + velocityY;

            // 플랫폼 충돌 체크
            let isOnPlatform = false;
            platforms.forEach(platform => {
                // 캐릭터의 바닥 위치와 플랫폼의 상단 위치를 정확히 계산
                const actualPlayerHeight = player.height - (hitboxOffset * player.scale.y);
                const currentBottom = player.y + actualPlayerHeight;
                const nextBottom = nextY + actualPlayerHeight;
                
                // 플랫폼과의 충돌 감지 (현재 위치와 다음 위치 사이에서 충돌이 발생하는지 확인)
                if (nextBottom > platform.y && 
                    nextY + hitboxOffset * player.scale.y < platform.y + platform.height &&
                    player.x + player.width > platform.x && 
                    player.x < platform.x + platform.width) {
                    
                    // 낙하 중일 때만 플랫폼에 착지
                    if (velocityY > 0 && currentBottom <= platform.y) {
                        player.y = platform.y - actualPlayerHeight;
                        velocityY = 0;
                        isJumping = false;
                        isOnPlatform = true;
                        
                        if (!isMoving) {
                            resetToFirstFrame();
                        }
                    }
                    // 플랫폼 아래에서 위로 올라갈 때는 통과
                    else if (velocityY < 0) {
                        isOnPlatform = false;
                    }
                }
            });

            // 플랫폼에 있지 않을 때만 Y 위치 업데이트
            if (!isOnPlatform) {
                player.y = nextY;
            }

            // 바닥 충돌 체크 (플랫폼에 서있지 않을 때만)
            if (!isOnPlatform && player.y + player.height > app.screen.height) {
                player.y = app.screen.height - player.height;
                velocityY = 0;
                isJumping = false;
                if (!isMoving) {
                    resetToFirstFrame();
                }
            }
        });
    } catch (error) {
        console.error("Error in game initialization:", error);
    }
}

// 게임 시작
main();
