import React, { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'

const PlayerContainer = styled.div`
    width: 100%;
    background-color: var(--color-grey-0);
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    padding: 20px;
    margin: 20px 0;
    border: 1px solid var(--color-grey-200);
`

const PlayerHeader = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 20px;
`

const CoverArt = styled.div`
    width: 60px;
    height: 60px;
    border-radius: 8px;
    background-color: var(--color-primary-200);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 15px;
    flex-shrink: 0;

    svg {
        width: 30px;
        height: 30px;
        color: var(--color-primary-700);
    }
`

const TrackInfo = styled.div`
    flex-grow: 1;
    overflow: hidden;
`

const TrackTitle = styled.div`
    font-weight: 600;
    font-size: 1.6rem;
    color: var(--color-grey-800);
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`

const TrackDetails = styled.div`
    font-size: 1.4rem;
    color: var(--color-grey-500);
`

const Controls = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 15px;
`

const ProgressContainer = styled.div`
    flex-grow: 1;
    height: 6px;
    background-color: var(--color-grey-200);
    border-radius: 3px;
    cursor: pointer;
    position: relative;
    margin: 0 15px;
`

const Progress = styled.div`
    height: 100%;
    background-color: var(--color-primary-600);
    border-radius: 3px;
    width: ${(props) => props.progress}%;
`

const ProgressHandle = styled.div`
    position: absolute;
    width: 16px;
    height: 16px;
    background-color: var(--color-primary-600);
    border-radius: 50%;
    top: 50%;
    transform: translateY(-50%);
    left: ${(props) => props.position}%;
    margin-left: -8px;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
    opacity: ${(props) => (props.visible ? '1' : '0')};
    transition: opacity 0.3s;
`

const Button = styled.button`
    background: none;
    border: none;
    color: var(--color-grey-700);
    font-size: 16px;
    cursor: pointer;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.2s;

    &:hover {
        background-color: var(--color-grey-100);
        color: var(--color-primary-600);
    }

    svg {
        width: 22px;
        height: 22px;
    }
`

const PlayButton = styled(Button)`
    background-color: var(--color-primary-600);
    color: white;
    width: 50px;
    height: 50px;

    &:hover {
        background-color: var(--color-primary-700);
        color: white;
    }

    svg {
        width: 26px;
        height: 26px;
    }
`

const TimeDisplay = styled.div`
    color: var(--color-grey-600);
    font-size: 1.4rem;
    min-width: 70px;
    text-align: center;
`

const VolumeControl = styled.div`
    display: flex;
    align-items: center;
    margin-left: 10px;
`

const VolumeSlider = styled.input`
    width: 80px;
    margin-left: 8px;
    accent-color: var(--color-primary-600);
`

// 音频图标
const AudioIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
    >
        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
    </svg>
)

// 播放图标
const PlayIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
    >
        <path d="M8 5v14l11-7z" />
    </svg>
)

// 暂停图标
const PauseIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
    >
        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
)

// 快退图标
const RewindIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
    >
        <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z" />
    </svg>
)

// 快进图标
const ForwardIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
    >
        <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z" />
    </svg>
)

// 音量图标
const VolumeIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
    >
        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    </svg>
)

// 格式化时间
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`
}

function AudioPlayer({ src, title, artist }) {
    const audioRef = useRef(null)
    const progressRef = useRef(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [progress, setProgress] = useState(0)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [volume, setVolume] = useState(1)
    const [showProgressHandle, setShowProgressHandle] = useState(false)

    // 更新进度
    const updateProgress = () => {
        if (audioRef.current) {
            const currentProgress =
                (audioRef.current.currentTime / audioRef.current.duration) * 100
            setProgress(currentProgress)
            setCurrentTime(audioRef.current.currentTime)
        }
    }

    // 处理元数据加载
    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration)
        }
    }

    // 播放/暂停切换
    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause()
            } else {
                audioRef.current.play()
            }
            setIsPlaying(!isPlaying)
        }
    }

    // 进度条点击
    const handleProgressClick = (e) => {
        if (progressRef.current && audioRef.current) {
            const rect = progressRef.current.getBoundingClientRect()
            const clickPosition = (e.clientX - rect.left) / rect.width
            const newTime = clickPosition * audioRef.current.duration

            audioRef.current.currentTime = newTime
            setProgress(clickPosition * 100)
            setCurrentTime(newTime)
        }
    }

    // 快进
    const handleForward = () => {
        if (audioRef.current) {
            const newTime = Math.min(
                audioRef.current.duration,
                audioRef.current.currentTime + 10
            )
            audioRef.current.currentTime = newTime
            setCurrentTime(newTime)
        }
    }

    // 快退
    const handleRewind = () => {
        if (audioRef.current) {
            const newTime = Math.max(0, audioRef.current.currentTime - 10)
            audioRef.current.currentTime = newTime
            setCurrentTime(newTime)
        }
    }

    // 音量变化
    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value)
        setVolume(newVolume)
        if (audioRef.current) {
            audioRef.current.volume = newVolume
        }
    }

    return (
        <PlayerContainer
            onMouseEnter={() => setShowProgressHandle(true)}
            onMouseLeave={() => setShowProgressHandle(false)}
        >
            <audio
                ref={audioRef}
                src={src}
                onTimeUpdate={updateProgress}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
            />

            <PlayerHeader>
                <CoverArt>
                    <AudioIcon />
                </CoverArt>
                <TrackInfo>
                    <TrackTitle>{title || '未知音频'}</TrackTitle>
                    <TrackDetails>{artist || '未知艺术家'}</TrackDetails>
                </TrackInfo>
            </PlayerHeader>

            <Controls>
                <Button onClick={handleRewind}>
                    <RewindIcon />
                </Button>

                <PlayButton onClick={togglePlay}>
                    {isPlaying ? <PauseIcon /> : <PlayIcon />}
                </PlayButton>

                <Button onClick={handleForward}>
                    <ForwardIcon />
                </Button>

                <TimeDisplay>{formatTime(currentTime)}</TimeDisplay>

                <ProgressContainer
                    ref={progressRef}
                    onClick={handleProgressClick}
                >
                    <Progress progress={progress} />
                    <ProgressHandle
                        position={progress}
                        visible={showProgressHandle}
                    />
                </ProgressContainer>

                <TimeDisplay>{formatTime(duration)}</TimeDisplay>

                <VolumeControl>
                    <Button>
                        <VolumeIcon />
                    </Button>
                    <VolumeSlider
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={handleVolumeChange}
                    />
                </VolumeControl>
            </Controls>
        </PlayerContainer>
    )
}

export default AudioPlayer
