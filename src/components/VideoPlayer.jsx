import React, { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'

const PlayerContainer = styled.div`
    position: relative;
    width: 100%;
    background-color: #000;
    border-radius: 8px;
    overflow: hidden;
`

const Video = styled.video`
    width: 100%;
    display: block;
    cursor: pointer;
`

const Controls = styled.div`
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
    padding: 20px 15px 10px;
    display: flex;
    align-items: center;
    transition: opacity 0.3s;
    opacity: ${(props) => (props.visible ? '1' : '0')};
`

const ProgressContainer = styled.div`
    flex-grow: 1;
    height: 5px;
    background-color: rgba(255, 255, 255, 0.3);
    border-radius: 5px;
    margin: 0 10px;
    cursor: pointer;
    position: relative;
`

const Progress = styled.div`
    height: 100%;
    background-color: var(--color-primary-600);
    border-radius: 5px;
    width: ${(props) => props.progress}%;
`

const ProgressHandle = styled.div`
    position: absolute;
    width: 14px;
    height: 14px;
    background-color: var(--color-primary-600);
    border-radius: 50%;
    top: 50%;
    transform: translateY(-50%);
    left: ${(props) => props.position}%;
    margin-left: -7px;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
    opacity: ${(props) => (props.visible ? '1' : '0')};
    transition: opacity 0.3s;
`

const Button = styled.button`
    background: none;
    border: none;
    color: #fff;
    font-size: 18px;
    cursor: pointer;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background-color 0.3s;

    &:hover {
        background-color: rgba(255, 255, 255, 0.2);
    }

    svg {
        width: 20px;
        height: 20px;
    }
`

const TimeDisplay = styled.div`
    color: #fff;
    font-size: 14px;
    margin-left: 10px;
`

const PlayIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
    >
        <path d="M8 5v14l11-7z" />
    </svg>
)

const PauseIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
    >
        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
)

const FullscreenIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
    >
        <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
    </svg>
)

const VolumeIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
    >
        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    </svg>
)

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`
}

function VideoPlayer({ src, poster, type }) {
    const videoRef = useRef(null)
    const progressRef = useRef(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [progress, setProgress] = useState(0)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [showControls, setShowControls] = useState(true)
    const [controlsTimeout, setControlsTimeout] = useState(null)

    // 更新进度
    const updateProgress = () => {
        if (videoRef.current) {
            const currentProgress =
                (videoRef.current.currentTime / videoRef.current.duration) * 100
            setProgress(currentProgress)
            setCurrentTime(videoRef.current.currentTime)
        }
    }

    // 处理视频加载后的元数据
    const handleLoadedMetadata = () => {
        setDuration(videoRef.current.duration)
    }

    // 处理播放/暂停
    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause()
            } else {
                videoRef.current.play()
            }
            setIsPlaying(!isPlaying)
        }
    }

    // 处理进度条点击
    const handleProgressClick = (e) => {
        if (progressRef.current && videoRef.current) {
            const rect = progressRef.current.getBoundingClientRect()
            const clickPosition = (e.clientX - rect.left) / rect.width
            const newTime = clickPosition * videoRef.current.duration

            videoRef.current.currentTime = newTime
            setProgress(clickPosition * 100)
            setCurrentTime(newTime)
        }
    }

    // 处理全屏
    const handleFullscreen = () => {
        if (videoRef.current) {
            if (videoRef.current.requestFullscreen) {
                videoRef.current.requestFullscreen()
            } else if (videoRef.current.webkitRequestFullscreen) {
                videoRef.current.webkitRequestFullscreen()
            } else if (videoRef.current.msRequestFullscreen) {
                videoRef.current.msRequestFullscreen()
            }
        }
    }

    // 处理鼠标移动显示控件
    const handleMouseMove = () => {
        setShowControls(true)

        // 清除之前的超时
        if (controlsTimeout) {
            clearTimeout(controlsTimeout)
        }

        // 设置新的超时来隐藏控件
        const timeout = setTimeout(() => {
            if (isPlaying) {
                setShowControls(false)
            }
        }, 3000)

        setControlsTimeout(timeout)
    }

    // 组件卸载时清理
    useEffect(() => {
        return () => {
            if (controlsTimeout) {
                clearTimeout(controlsTimeout)
            }
        }
    }, [controlsTimeout])

    return (
        <PlayerContainer onMouseMove={handleMouseMove}>
            <Video
                ref={videoRef}
                poster={poster}
                onClick={togglePlay}
                onTimeUpdate={updateProgress}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
            >
                <source src={src} type={type || 'video/mp4'} />
                您的浏览器不支持视频播放
            </Video>

            <Controls visible={showControls}>
                <Button onClick={togglePlay}>
                    {isPlaying ? <PauseIcon /> : <PlayIcon />}
                </Button>

                <ProgressContainer
                    ref={progressRef}
                    onClick={handleProgressClick}
                >
                    <Progress progress={progress} />
                    <ProgressHandle
                        position={progress}
                        visible={showControls}
                    />
                </ProgressContainer>

                <TimeDisplay>
                    {formatTime(currentTime)} / {formatTime(duration)}
                </TimeDisplay>

                <Button onClick={handleFullscreen}>
                    <FullscreenIcon />
                </Button>
            </Controls>
        </PlayerContainer>
    )
}

export default VideoPlayer
