import React, { useReducer, useRef } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
// import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import EditorBalloon from "@ckeditor/ckeditor5-build-balloon";
import { useGlobalContext } from "../../context/AppContext";
import { Navigate } from "react-router";
const CreateBlog = () => {
	let { credentials, firebase } = useGlobalContext();
	const [stored, setStored] = useReducer(storedFunc, { stored: false, published: false });
	let article = useRef(null);
	let header = useRef(null);

	function storedFunc(stored, action) {
		switch (action.type) {
			case "saveDraft":
				return { ...stored, stored: true };
			case "publish":
				return { ...stored, published: true };
			default:
				return stored;
		}
	}
	function publishArticle(e) {
		let message = article.current.editor.getData();
		let heading = header.current.editor.getData();
		firebase.storeBlog({ type: "publish", heading, message, author: credentials?.user?.username }, (res) => {
			if (res.error) return;
			setStored({ type: "publish" });
		});
	}
	return (
		<>
			<section className="App createBlog">
				<p className="username">{credentials?.user?.username}</p>
				<div className="controls">
					<a href="https://read.cash/@Read.Cash/how-to-use-the-editor-at-readcash-e2df60aa" target="_blank" rel="noreferrer">
						Editor help
					</a>
					<button className="draft">Save as Draft</button>
					<button onClick={publishArticle}>Publish</button>
					<div className="dots"></div>
				</div>

				<div className="adds">
					<button>Add Topics</button>
					<button>Submit to community</button>
					<button>Add lead image</button>
				</div>
				<article className="editor header">
					<CKEditor
						editor={EditorBalloon}
						data=""
						ref={header}
						config={{ placeholder: "Add a title..." }}
						onReady={(editor) => {
							// You can store the "editor" and use when it is needed.
							// console.log("Editor is ready to use!", editor);
							editor.editing.view.change((writer) => {
								writer.setStyle("min-height", "50px", editor.editing.view.document.getRoot());
								writer.setStyle("font-size", "42px", editor.editing.view.document.getRoot());
								writer.setStyle("font-weight", "bold", editor.editing.view.document.getRoot());
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
								writer.setStyle("min-height", "300px", editor.editing.view.document.getRoot());
								writer.setStyle("font-size", "17px", editor.editing.view.document.getRoot());
							});
						}}
						config={{ placeholder: "Then start writing..." }}
					/>
				</article>
			</section>
			{stored.published && <Navigate to={`/@${credentials?.user?.username}`} />}
		</>
	);
};

export default CreateBlog;
