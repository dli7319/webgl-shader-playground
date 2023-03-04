import React from 'react';
import { createRoot } from 'react-dom/client';
import ShaderPlayground from './ShaderPlayground';

const body = document.querySelector('main');
const root = createRoot(body);
root.render(<ShaderPlayground />);