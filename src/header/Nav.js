import React, { useState } from 'react';
import {
    MenuOutlined,
    FundViewOutlined,
    CopyrightCircleOutlined,
    UserOutlined,
    CloseOutlined
} from '@ant-design/icons';
import { Dropdown, Space } from 'antd';
import Label from './Label';
import './Nav.css';


const MyCustomMenu = ({menuState, onSelect}) => {
    return (
        <div className={`menu-icons ${menuState ? "menu-open" : null}`}>
            <FundViewOutlined className="menu-icon" onClick={() => onSelect("Пространство валют")}/>
            <CopyrightCircleOutlined className="menu-icon" onClick={() => onSelect("Монеты")}/>
            <UserOutlined className="menu-icon" onClick={() => onSelect("Профиль")}/>
        </div>
    );
};

const Nav = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [label, setLabel] = useState("Пространство валют");

    return (
        <>
            <Label label={label} />
            <div className="menu">
                <Dropdown
                popupRender={() => <MyCustomMenu menuState={menuOpen} onSelect={setLabel}/>}
                trigger={['click']}
                placement="left"
                onOpenChange={() => setMenuOpen(!menuOpen)}
                >
                    <a onClick={e => e.preventDefault()}>
                        <Space>
                            {menuOpen
                            ? <CloseOutlined className="menu-icon" />
                            : <MenuOutlined className="menu-icon" />
                            }
                        </Space>
                    </a>
                </Dropdown>

            </div>
        </>
    );
};

export default Nav;