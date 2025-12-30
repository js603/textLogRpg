import React from 'react';
import { Settings, X } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const { settings, updateSettings } = useSettings();

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-title">
                        <Settings className="w-5 h-5" />
                        <h2>게임 설정</h2>
                    </div>
                    <button className="modal-close" onClick={onClose}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="modal-body">
                    <div className="setting-group">
                        <label className="setting-label">서사 표현 방식</label>
                        <div className="setting-options">
                            <label className="setting-option">
                                <input
                                    type="radio"
                                    name="narrativeStyle"
                                    checked={settings.narrativeStyle === 'classic'}
                                    onChange={() => updateSettings({ narrativeStyle: 'classic' })}
                                />
                                <div className="option-content">
                                    <div className="option-title">클래식 모드</div>
                                    <div className="option-desc">깔끔한 로그 스타일로 표시</div>
                                </div>
                            </label>

                            <label className="setting-option">
                                <input
                                    type="radio"
                                    name="narrativeStyle"
                                    checked={settings.narrativeStyle === 'novel'}
                                    onChange={() => updateSettings({ narrativeStyle: 'novel' })}
                                />
                                <div className="option-content">
                                    <div className="option-title">소설 모드</div>
                                    <div className="option-desc">몰입감 있는 소설 스타일 (애니메이션 효과)</div>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="setting-info">
                        💡 설정은 자동으로 저장됩니다
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-primary" onClick={onClose}>
                        확인
                    </button>
                </div>
            </div>
        </div>
    );
}
