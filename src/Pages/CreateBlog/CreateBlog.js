import React, { useRef } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
// import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import EditorBalloon from "@ckeditor/ckeditor5-build-balloon";
const CreateBlog = () => {
	let article = useRef(null);
	let header = useRef(null);
	function publishArticle(e) {
		let message = article.current.editor.getData();
		let heading = header.current.editor.getData();
	}
	return (
		<section className="App createBlog">
			<div className="controls">
				<p>Create A Blog</p>
				<div className="actions">
					<button onClick={publishArticle}>Publish</button>
					<button className="draft">Save Draft</button>
					<button className="discard">Discard</button>
				</div>
			</div>
			<article className="editor header">
				<CKEditor
					editor={EditorBalloon}
					data=""
					ref={header}
					config={{ placeholder: "Blog header" }}
					onReady={(editor) => {
						// You can store the "editor" and use when it is needed.
						// console.log("Editor is ready to use!", editor);
						editor.editing.view.change((writer) => {
							writer.setStyle("min-height", "50px", editor.editing.view.document.getRoot());
							writer.setStyle("font-size", "32px", editor.editing.view.document.getRoot());
						});
					}}
				/>
			</article>
			<article className="editor">
				<CKEditor
					editor={EditorBalloon}
					data=""
					ref={article}
					onReady={(editor) => {
						// You can store the "editor" and use when it is needed.
						// console.log("Editor is ready to use!", editor);
						editor.editing.view.change((writer) => {
							writer.setStyle("min-height", "250px", editor.editing.view.document.getRoot());
							writer.setStyle("font-size", "16px", editor.editing.view.document.getRoot());
						});
					}}
					config={{ placeholder: "Enter body here. PS; Select a text or section to get access to editing tools" }}
				/>
			</article>
		</section>
	);
};

export default CreateBlog;
