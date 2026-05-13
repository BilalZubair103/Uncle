/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Chat from './components/Chat';

export default function App() {
  return (
    <div className="h-screen w-screen bg-border-outer p-2 md:p-8 overflow-hidden">
      <div className="h-full w-full bg-parchment text-ink font-sans flex overflow-hidden border border-border-inner shadow-2xl relative">
        <Chat />
      </div>
    </div>
  );
}
