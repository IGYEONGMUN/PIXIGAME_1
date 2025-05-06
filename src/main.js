import "./style.css";
import {
  Assets,
  Application,
  AnimatedSprite,
  Texture,
  Rectangle,
  TilingSprite,
  Text,
} from "pixi.js";

export default async function main() {
  // PixiJS 애플리케이션 초기화
  const app = new Application();
  await app.init({
    resizeTo: window,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
  });

  // 캔버스 설정
  app.canvas.id = "game-canvas";
  document.body.appendChild(app.canvas);

  // 점수 변수 초기화
  let score = 0;

  // 점수 텍스트 생성
  const scoreText = new Text({
    text: `Score: ${score}`,
    style: {
      fontFamily: "Arial",
      fontSize: 24,
      color: 0x000000,
      fill: 0x000000,
      stroke: 0xffffff,
      strokeThickness: 4,
    },
  });
  scoreText.zIndex = 100;
  scoreText.x = 20;
  scoreText.y = 20;
  app.stage.addChild(scoreText);

  try {
    // 에셋 로드
    const walkSheet = await Assets.load(
      "./assets/Slime1/Walk/Slime1_Walk_body.png"
    );
    const jumpSheet = await Assets.load(
      "./assets/Slime1/Run/Slime1_Run_body.png"
    );
    const bgTexture = await Assets.load("./assets/BackGrounds/city 7/7.png");
    const Tile = await Assets.load(
      "./assets/Tiles&Objects/1 Tiles/Tile_01.png"
    );
    const Object = await Assets.load("./assets/CyberFunkObject/Icon14_01.png");
    const Object2 = await Assets.load("./assets/CyberFunkObject/Icon14_02.png");
    const Object3 = await Assets.load("./assets/CyberFunkObject/Icon14_03.png");
    const Object4 = await Assets.load("./assets/CyberFunkObject/Icon14_04.png");
    const Object5 = await Assets.load("./assets/CyberFunkObject/Icon14_05.png");
    const Object6 = await Assets.load("./assets/CyberFunkObject/Icon14_06.png");
    const Object7 = await Assets.load("./assets/CyberFunkObject/Icon14_07.png");
    const Object8 = await Assets.load("./assets/CyberFunkObject/Icon14_08.png");
    const Object9 = await Assets.load("./assets/CyberFunkObject/Icon14_09.png");
    const Object10 = await Assets.load(
      "./assets/CyberFunkObject/Icon14_10.png"
    );
    const Object11 = await Assets.load(
      "./assets/CyberFunkObject/Icon14_11.png"
    );
    const Object12 = await Assets.load(
      "./assets/CyberFunkObject/Icon14_12.png"
    );
    const Object13 = await Assets.load(
      "./assets/CyberFunkObject/Icon14_13.png"
    );
    const Object14 = await Assets.load(
      "./assets/CyberFunkObject/Icon14_14.png"
    );
    const Object15 = await Assets.load(
      "./assets/CyberFunkObject/Icon14_15.png"
    );
    const Object16 = await Assets.load(
      "./assets/CyberFunkObject/Icon14_16.png"
    );
    const Object17 = await Assets.load(
      "./assets/CyberFunkObject/Icon14_17.png"
    );
    const Object18 = await Assets.load(
      "./assets/CyberFunkObject/Icon14_18.png"
    );
    const Object19 = await Assets.load(
      "./assets/CyberFunkObject/Icon14_19.png"
    );
    const Object20 = await Assets.load(
      "./assets/CyberFunkObject/Icon14_20.png"
    );
    const Object21 = await Assets.load(
      "./assets/CyberFunkObject/Icon14_21.png"
    );
    const Object22 = await Assets.load(
      "./assets/CyberFunkObject/Icon14_22.png"
    );
    const Object23 = await Assets.load(
      "./assets/CyberFunkObject/Icon14_23.png"
    );
    const Object24 = await Assets.load(
      "./assets/CyberFunkObject/Icon14_24.png"
    );

    // Object 텍스처 배열 생성
    const objectTextures = [
      Object,
      Object2,
      Object3,
      Object4,
      Object5,
      Object6,
      Object7,
      Object8,
      Object9,
      Object10,
      Object11,
      Object12,
      Object13,
      Object14,
      Object15,
      Object16,
      Object17,
      Object18,
      Object19,
      Object20,
      Object21,
      Object22,
      Object23,
    ];

    // 플랫폼 배열 생성
    const platforms = [];

    // 배경 추가
    const bgSprite = new TilingSprite({
      texture: bgTexture,
      width: app.screen.width,
      height: app.screen.height,
    });
    app.stage.addChild(bgSprite);
    bgSprite.tileScale.set(1);

    // 배경 스케일 조정 함수
    function adjustBackgroundScale() {
      const scale = window.innerHeight / bgTexture.height;
      bgSprite.tileScale.set(scale);
      bgSprite.width = window.innerWidth;
      bgSprite.height = window.innerHeight;
    }

    adjustBackgroundScale();
    window.addEventListener("resize", adjustBackgroundScale);

    // 배경 움직임 추가
    app.ticker.add(() => {
      bgSprite.tilePosition.x -= 2;
      platforms.forEach((platform) => {
        platform.x -= 7;

        // 타일이 화면 왼쪽으로 완전히 사라지면 오른쪽으로 재배치
        if (platform.x + platform.width < 0) {
          platform.x = app.screen.width;
          platform.y = Math.floor(Math.random() * app.screen.height);
        }
      });
    });

    // 걷기 애니메이션 프레임 생성 (1행 사용)
    const walkFrames = [];
    const frameWidth = 64;
    const frameHeight = 64;
    const framesInRow = 8;
    const targetRow = 0; // 1행 (0부터 시작)

    for (let i = 0; i < framesInRow; i++) {
      const frame = new Texture({
        source: walkSheet,
        frame: new Rectangle(
          i * frameWidth,
          targetRow * frameHeight,
          frameWidth,
          frameHeight
        ),
      });
      walkFrames.push(frame);
    }

    // 점프 애니메이션 프레임 생성 (오른쪽 점프: 3행, 왼쪽 점프: 2행)
    const jumpRightFrames = [];
    const jumpLeftFrames = [];
    const totalJumpFrames = 8;
    const targetRowJumpRight = 3; // 오른쪽 점프 (4행)
    const targetRowJumpLeft = 2; // 왼쪽 점프 (3행)

    for (let i = 0; i < totalJumpFrames; i++) {
      // 오른쪽 점프 프레임
      const frameRight = new Texture({
        source: jumpSheet,
        frame: new Rectangle(
          i * frameWidth,
          targetRowJumpRight * frameHeight,
          frameWidth,
          frameHeight
        ),
      });
      jumpRightFrames.push(frameRight);

      // 왼쪽 점프 프레임
      const frameLeft = new Texture({
        source: jumpSheet,
        frame: new Rectangle(
          i * frameWidth,
          targetRowJumpLeft * frameHeight,
          frameWidth,
          frameHeight
        ),
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

    // 플랫폼 정의 (x, y, width, height)
    const platformConfigs = [];

    // 랜덤 플랫폼 추가
    const randomPlatformCount = 15;
    for (let i = 0; i < randomPlatformCount; i++) {
      const width = 32;
      const height = 32;
      const x = Math.floor(Math.random() * app.screen.width);
      const y = Math.floor(Math.random() * app.screen.height - 200);
      platformConfigs.push({ x, y, width, height });
    }

    // 플랫폼 생성 및 추가
    platformConfigs.forEach((config) => {
      // 랜덤하게 Object 텍스처 선택
      const randomTexture =
        objectTextures[Math.floor(Math.random() * objectTextures.length)];
      const platform = new TilingSprite({
        texture: randomTexture,
        width: config.width,
        height: config.height,
      });
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
    let canDoubleJump = false; // 이중점프 가능 여부
    let isMoving = false;
    let currentAnimation = "walk";
    let lastDirection = "right"; // 마지막 이동 방향 저장

    // 애니메이션 전환 함수
    function changeAnimation(animation, direction) {
      if (currentAnimation === animation && direction === lastDirection) return;

      currentAnimation = animation;
      lastDirection = direction;
      let frames;

      if (animation === "walk") {
        frames = walkFrames;
      } else if (animation === "jump") {
        frames = direction === "right" ? jumpRightFrames : jumpLeftFrames;
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
        const newDirection = e.key === "ArrowRight" ? "right" : "left";
        if (isJumping) {
          changeAnimation("jump", newDirection);
        } else {
          changeAnimation("walk", newDirection);
        }
      }
      if (e.key === " " && !isJumping) {
        // 첫 점프
        isJumping = true;
        canDoubleJump = true; // 이중점프 가능 상태로 변경
        changeAnimation("jump", lastDirection);
        velocityY = jumpForce;
      } else if (e.key === " " && isJumping && canDoubleJump) {
        // 이중점프
        canDoubleJump = false; // 이중점프 사용
        velocityY = jumpForce * 0.8; // 두 번째 점프는 약간 낮게
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
          changeAnimation("walk", "left");
        } else {
          changeAnimation("jump", "left");
        }
      }
      if (keys["ArrowRight"]) {
        player.x += 5;
        if (!isJumping) {
          changeAnimation("walk", "right");
        } else {
          changeAnimation("jump", "right");
        }
      }

      // 중력 적용
      velocityY += gravity;
      const nextY = player.y + velocityY;

      // 플랫폼 충돌 체크
      let isOnPlatform = false;
      platforms.forEach((platform, index) => {
        // 캐릭터의 바닥 위치와 플랫폼의 상단 위치를 정확히 계산
        const actualPlayerHeight =
          player.height - hitboxOffset * player.scale.y;
        const currentBottom = player.y + actualPlayerHeight;
        const nextBottom = nextY + actualPlayerHeight;

        // 캐릭터 중심점이 플랫폼 위에 있을 때만 착지
        const playerCenterX = player.x + player.width / 2;
        if (
          nextBottom > platform.y &&
          nextY + hitboxOffset * player.scale.y < platform.y &&
          playerCenterX > platform.x - platform.width &&
          playerCenterX < platform.x + platform.width + 25
        ) {
          // 낙하 중일 때만 플랫폼에 착지
          if (velocityY > 0 && currentBottom <= platform.y) {
            player.y = platform.y - actualPlayerHeight;
            velocityY = 0;
            isJumping = false;
            canDoubleJump = false; // 플랫폼에 착지하면 이중점프 초기화
            isOnPlatform = true;

            // 플랫폼을 제거
            app.stage.removeChild(platform);
            platforms.splice(index, 1);

            // 점수 증가
            score += 1;
            scoreText.text = `Score: ${score}`;

            // 새로운 플랫폼 생성
            const width = 32;
            const height = 32;
            const x = app.screen.width; // 화면 오른쪽 끝에서 생성
            const y = Math.floor(Math.random() * (app.screen.height - 200));

            // 랜덤하게 Object 텍스처 선택
            const randomTexture =
              objectTextures[Math.floor(Math.random() * objectTextures.length)];
            const newPlatform = new TilingSprite({
              texture: randomTexture,
              width: width,
              height: height,
            });
            newPlatform.x = x;
            newPlatform.y = y;
            app.stage.addChild(newPlatform);
            platforms.push(newPlatform);

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
        canDoubleJump = false; // 바닥에 착지하면 이중점프 초기화
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
